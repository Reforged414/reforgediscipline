import Foundation
import UIKit
import Capacitor
import FamilyControls
import ManagedSettings

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
            guard let url = URL(string: UIApplication.openSettingsURLString),
                  UIApplication.shared.canOpenURL(url) else {
                call.reject("Could not open settings URL")
                return
            }
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            call.resolve()
        }
    }
}
