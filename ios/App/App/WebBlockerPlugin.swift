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
        CAPPluginMethod(name: "checkAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "block", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "activateShield", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deactivateShield", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise)
    ]

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
            let center = AuthorizationCenter.shared
            let status: String
            switch center.authorizationStatus {
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
            let store = ManagedSettingsStore()
            if enabled {
                store.webContent.blockedByFilter = .auto(Set<WebDomain>(), except: Set<WebDomain>())
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
        let enabled = call.getBool("enabled", true)
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
            // Use a robust URL fallback scheme to ensure Settings opens
            let settingsUrlString = "App-Prefs:root"
            if let url = URL(string: settingsUrlString), UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
                call.resolve(["opened": true])
            } else if let fallbackUrl = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(fallbackUrl, options: [:], completionHandler: nil)
                call.resolve(["opened": true])
            } else {
                call.reject("Unable to open device settings application")
            }
        }
    }
}
