import Foundation
import Capacitor

#if canImport(FamilyControls)
import FamilyControls
import ManagedSettings
import DeviceActivity
#endif

/// Skeleton bridge for Apple's Screen Time stack (FamilyControls + ManagedSettings).
///
/// This plugin is intentionally a placeholder: it exposes the JS surface our
/// `useScreenTimeBlocker` hook calls into, requests authorization on iOS 16+,
/// and wires up a `ManagedSettingsStore` we can later populate with
/// `shield.applications`, `shield.webDomains`, and category restrictions.
///
/// Register in `AppDelegate` / `Main.storyboard` bridge once you add a
/// DeviceActivity / ManagedSettings extension target.
@objc(ScreenTimeShieldPlugin)
public class ScreenTimeShieldPlugin: CAPPlugin {

    #if canImport(FamilyControls)
    @available(iOS 16.0, *)
    private static let store = ManagedSettingsStore(named: .init("ReforgedShield"))
    #endif

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            Task {
                do {
                    try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                    call.resolve(["status": "authorized"])
                } catch {
                    call.reject("FamilyControls authorization failed: \(error.localizedDescription)")
                }
            }
            return
        }
        #endif
        call.resolve(["status": "unsupported"])
    }

    @objc func activateShield(_ call: CAPPluginCall) {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            // TODO: populate with FamilyActivitySelection persisted from a
            // FamilyActivityPicker presented in SwiftUI. For now we mark the
            // store as active so the JS layer can confirm the bridge works.
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
