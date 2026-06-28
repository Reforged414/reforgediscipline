import Foundation
import Capacitor

#if canImport(FamilyControls)
import FamilyControls
import ManagedSettings
#endif

/// Modern Capacitor 6+ Swift-only plugin. No Objective-C bridge required.
/// Registered in AppDelegate via `registerPluginInstance(WebBlockerPlugin())`.
@objc(WebBlockerPlugin)
public class WebBlockerPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WebBlockerPlugin"
    public let jsName = "WebBlockerPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "activateShield", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deactivateShield", returnType: CAPPluginReturnPromise)
    ]

    #if canImport(FamilyControls)
    @available(iOS 16.0, *)
    private static let store = ManagedSettingsStore(named: .init("ReforgedWebBlocker"))
    #endif

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            DispatchQueue.main.async {
                Task { @MainActor in
                    do {
                        try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                        let status = AuthorizationCenter.shared.authorizationStatus
                        call.resolve(["status": status == .approved ? "authorized" : "denied"])
                    } catch {
                        call.resolve([
                            "status": "denied",
                            "error": error.localizedDescription
                        ])
                    }
                }
            }
            return
        }
        #endif
        call.resolve(["status": "unsupported"])
    }

    @objc func checkAuthorization(_ call: CAPPluginCall) {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            let status = AuthorizationCenter.shared.authorizationStatus
            let mapped: String
            switch status {
            case .approved: mapped = "authorized"
            case .denied: mapped = "denied"
            default: mapped = "notDetermined"
            }
            call.resolve(["status": mapped, "familyControls": status == .approved])
            return
        }
        #endif
        call.resolve(["status": "unsupported", "familyControls": false])
    }

    @objc func activateShield(_ call: CAPPluginCall) {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            DispatchQueue.main.async {
                Self.store.shield.webDomainCategories = .all()
                call.resolve(["active": true])
            }
            return
        }
        #endif
        call.resolve(["active": false, "reason": "unsupported"])
    }

    @objc func deactivateShield(_ call: CAPPluginCall) {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            DispatchQueue.main.async {
                Self.store.clearAllSettings()
                call.resolve(["active": false])
            }
            return
        }
        #endif
        call.resolve(["active": false])
    }
}
