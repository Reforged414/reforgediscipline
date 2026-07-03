import Foundation
import UIKit
import Capacitor
import FamilyControls
import ManagedSettings

@available(iOS 16.0, *)
@objc(WebBlockerPlugin)
public class WebBlockerPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WebBlockerPlugin"
    public let jsName = "WebBlockerPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "block", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise)
    ]

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        Task {
            do {
                try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                call.resolve(["status": "approved"])
            } catch {
                call.reject("Authorization failed: \(error.localizedDescription)")
            }
        }
    }

    @objc func block(_ call: CAPPluginCall) {
        let store = ManagedSettingsStore()
        let enabled = call.getBoolean("enabled", true)

        if enabled {
            store.webContent.blockedByFilter = .auto(Set<WebDomain>(), except: Set<WebDomain>())
            call.resolve(["status": "blocked"])
        } else {
            store.webContent.blockedByFilter = nil
            call.resolve(["status": "unblocked"])
        }
    }

    @objc func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let settingsString = UIApplication.openSettingsURLString
            guard let url = URL(string: settingsString) else {
                call.reject("Invalid settings URL profile")
                return
            }

            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
                call.resolve()
            } else {
                call.reject("Unable to open device settings application")
            }
        }
    }
}
