import Foundation
import UIKit
import SwiftUI
import Capacitor
import FamilyControls
import ManagedSettings

class AppSelectionModel: ObservableObject {
    @Published var selection = FamilyActivitySelection()
}

struct AppActivityPickerView: View {
    @ObservedObject var model: AppSelectionModel
    var onDone: (FamilyActivitySelection) -> Void

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $model.selection)
                .navigationTitle("Select Apps to Block")
                .navigationBarItems(trailing: Button("Done") {
                    onDone(model.selection)
                })
        }
    }
}

@objc(WebBlockerPlugin)
public class WebBlockerPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WebBlockerPlugin"
    public let jsName = "WebBlockerPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "block", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "activateShield", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deactivateShield", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showAppPicker", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "activateAppShield", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deactivateAppShield", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkAppSelection", returnType: CAPPluginReturnPromise)
    ]

    private let store = ManagedSettingsStore()
    private static let appSelectionKey = "webblocker_app_selection"

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        if #available(iOS 16.0, *) {
            Task {
                do {
                    try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                    call.resolve(["status": "authorized"])
                } catch {
                    call.resolve([
                        "status": "denied",
                        "error": error.localizedDescription
                    ])
                }
            }
        } else {
            call.resolve(["status": "unsupported"])
        }
    }

    @objc func checkAuthorization(_ call: CAPPluginCall) {
        if #available(iOS 16.0, *) {
            let status: String
            switch AuthorizationCenter.shared.authorizationStatus {
            case .approved:
                status = "authorized"
            case .denied:
                status = "denied"
            case .notDetermined:
                status = "notDetermined"
            @unknown default:
                status = "notDetermined"
            }
            call.resolve([
                "status": status,
                "familyControls": status == "authorized"
            ])
        } else {
            call.resolve(["status": "unsupported", "familyControls": false])
        }
    }

    private func applyShield(enabled: Bool, call: CAPPluginCall) {
        if #available(iOS 16.0, *) {
            if enabled {
                // .auto() uses Apple's own built-in adult content classifier —
                // the same intelligence behind Settings > Screen Time > "Limit Adult Websites".
                // No manual domain list needed. You can optionally add extra domains to
                // block or exempt on top of it via the two parameters below.
                store.webContent.blockedByFilter = .auto([], except: [])
                call.resolve(["active": true, "status": "blocked"])
            } else {
                store.webContent.blockedByFilter = nil
                call.resolve(["active": false, "status": "unblocked"])
            }
        } else {
            call.reject("Screen Time APIs require iOS 16.0 or later")
        }
    }

    @objc func block(_ call: CAPPluginCall) {
        let enabled = call.getBool("enabled") ?? true
        applyShield(enabled: enabled, call: call)
    }

    @objc func activateShield(_ call: CAPPluginCall) {
        applyShield(enabled: true, call: call)
    }

    @objc func deactivateShield(_ call: CAPPluginCall) {
        applyShield(enabled: false, call: call)
    }

    @objc func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let url = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(url, options: [:]) { success in
                    call.resolve(["opened": success])
                }
            } else {
                call.reject("Unable to open device settings application")
            }
        }
    }

    // MARK: - App Blocking

    @objc func showAppPicker(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else {
            call.reject("Screen Time APIs require iOS 16.0 or later")
            return
        }
        guard let vc = self.bridge?.viewController else {
            call.reject("No view controller available")
            return
        }
        DispatchQueue.main.async {
            let model = AppSelectionModel()
            if let saved = WebBlockerPlugin.loadAppSelection() {
                model.selection = saved
            }
            let pickerView = AppActivityPickerView(model: model) { selection in
                WebBlockerPlugin.saveAppSelection(selection)
                vc.dismiss(animated: true) {
                    call.resolve([
                        "selected": true,
                        "appCount": selection.applicationTokens.count,
                        "categoryCount": selection.categoryTokens.count
                    ])
                }
            }
            let hosting = UIHostingController(rootView: pickerView)
            vc.present(hosting, animated: true)
        }
    }

    @objc func activateAppShield(_ call: CAPPluginCall) {
        guard #available(iOS 16.0, *) else {
            call.reject("Screen Time APIs require iOS 16.0 or later")
            return
        }
        guard let selection = WebBlockerPlugin.loadAppSelection(),
              !selection.applicationTokens.isEmpty || !selection.categoryTokens.isEmpty else {
            call.resolve(["active": false, "reason": "no_selection"])
            return
        }
        store.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
        store.shield.applicationCategories = selection.categoryTokens.isEmpty
            ? nil
            : .specific(selection.categoryTokens)
        call.resolve(["active": true])
    }

    @objc func deactivateAppShield(_ call: CAPPluginCall) {
        store.shield.applications = nil
        store.shield.applicationCategories = nil
        call.resolve(["active": false])
    }

    @objc func checkAppSelection(_ call: CAPPluginCall) {
        guard let selection = WebBlockerPlugin.loadAppSelection() else {
            call.resolve(["hasSelection": false, "appCount": 0, "categoryCount": 0])
            return
        }
        call.resolve([
            "hasSelection": !selection.applicationTokens.isEmpty || !selection.categoryTokens.isEmpty,
            "appCount": selection.applicationTokens.count,
            "categoryCount": selection.categoryTokens.count
        ])
    }

    @available(iOS 16.0, *)
    private static func saveAppSelection(_ selection: FamilyActivitySelection) {
        if let data = try? PropertyListEncoder().encode(selection) {
            UserDefaults.standard.set(data, forKey: appSelectionKey)
        }
    }

    @available(iOS 16.0, *)
    private static func loadAppSelection() -> FamilyActivitySelection? {
        guard let data = UserDefaults.standard.data(forKey: appSelectionKey) else { return nil }
        return try? PropertyListDecoder().decode(FamilyActivitySelection.self, from: data)
    }
}

// Since Capacitor 5, plugins that live inside the app target (rather than an
// npm package listed in packageClassList) are only loaded if they are handed
// to the bridge explicitly from a CAPBridgeViewController subclass.
// Main.storyboard instantiates this class instead of CAPBridgeViewController.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(WebBlockerPlugin())
    }
}
