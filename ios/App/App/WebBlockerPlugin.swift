import Foundation
import Capacitor

#if canImport(FamilyControls)
import FamilyControls
import ManagedSettings
#endif

/// Standard Capacitor @objc plugin bridge for Apple's Screen Time stack.
///
/// Companion Objective-C registration lives in `WebBlockerPlugin.m`, which uses
/// the `CAP_PLUGIN` / `CAP_PLUGIN_METHOD` macros so the Capacitor web runtime
/// can discover and invoke these methods from JavaScript.
///
/// IMPORTANT: The `com.apple.developer.family-controls` entitlement MUST be
/// present in `App.entitlements` AND the matching capability must be enabled
/// on the App ID in the Apple Developer portal, otherwise this code will fail
/// to compile / link against the FamilyControls framework.
@objc(WebBlockerPlugin)
public class WebBlockerPlugin: CAPPlugin {

    #if canImport(FamilyControls)
    @available(iOS 16.0, *)
    private static let store = ManagedSettingsStore(named: .init("ReforgedWebBlocker"))
    #endif

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            // The FamilyControls system prompt MUST be presented from the main
            // thread, otherwise iOS silently rejects the request and the
            // popup never appears.
            DispatchQueue.main.async {
                Task { @MainActor in
                    do {
                        try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                        let status = AuthorizationCenter.shared.authorizationStatus
                        call.resolve([
                            "status": status == .approved ? "authorized" : "denied"
                        ])
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
            call.resolve([
                "status": mapped,
                "familyControls": status == .approved
            ])
            return
        }
        #endif
        call.resolve(["status": "unsupported", "familyControls": false])
    }

    @objc func activateShield(_ call: CAPPluginCall) {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            Self.store.shield.webDomainCategories = .all()
            call.resolve(["active": true])
            return
        }
        #endif
        call.resolve(["active": false, "reason": "unsupported"])
    }

    @objc func deactivateShield(_ call: CAPPluginCall) {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            Self.store.clearAllSettings()
            call.resolve(["active": false])
            return
        }
        #endif
        call.resolve(["active": false])
    }
}
