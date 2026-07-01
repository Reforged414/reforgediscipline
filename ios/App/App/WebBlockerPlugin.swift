import Foundation
import Capacitor

#if canImport(FamilyControls)
import FamilyControls
import ManagedSettings
#endif

/// Modern Capacitor 6+ Swift-only plugin. No Objective-C bridge required.
@objc(WebBlockerPlugin)
public class WebBlockerPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WebBlockerPlugin"
    public let jsName = "WebBlockerPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "activateShield", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deactivateShield", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "blockDomain", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unblockDomains", returnType: CAPPluginReturnPromise)
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
                let store = ManagedSettingsStore()
                store.webContent.blockedByFilter = .auto()
                call.resolve(["active": true, "mode": "autoFilter"])
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
                let store = ManagedSettingsStore()
                store.webContent.blockedByFilter = nil
                call.resolve(["active": false])
            }
            return
        }
        #endif
        call.resolve(["active": false])
    }

    /// Block a single website domain (e.g. "instagram.com").
    /// Accepts either { domain: "instagram.com" } or { domains: ["a.com","b.com"] }.
    @objc func blockDomain(_ call: CAPPluginCall) {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            var inputs: [String] = []
            if let single = call.getString("domain"), !single.isEmpty {
                inputs.append(single)
            }
            if let many = call.getArray("domains") as? [String] {
                inputs.append(contentsOf: many)
            }
            let cleaned = inputs
                .map { $0.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() }
                .filter { !$0.isEmpty }

            guard !cleaned.isEmpty else {
                call.reject("No domain provided")
                return
            }

            DispatchQueue.main.async {
                let store = ManagedSettingsStore()
                let webDomains = Set(cleaned.map { WebDomain(domain: $0) })
                store.webContent.blockedByFilter = .specific(webDomains)
                call.resolve([
                    "blocked": true,
                    "domains": cleaned
                ])
            }
            return
        }
        #endif
        call.resolve(["blocked": false, "reason": "unsupported"])
    }

    /// Clear the per-domain shield.
    @objc func unblockDomains(_ call: CAPPluginCall) {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            DispatchQueue.main.async {
                let store = ManagedSettingsStore()
                store.webContent.blockedByFilter = nil
                call.resolve(["blocked": false])
            }
            return
        }
        #endif
        call.resolve(["blocked": false])
    }
}
