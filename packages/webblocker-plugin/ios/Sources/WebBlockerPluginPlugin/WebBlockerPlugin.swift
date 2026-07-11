import Foundation
import UIKit
import FamilyControls
import ManagedSettings

@objc public class WebBlockerPlugin: NSObject {
    private let store = ManagedSettingsStore()

    private static var blockedDomains: Set<WebDomain> = {
        guard let url = Bundle.module.url(forResource: "BlockedDomains", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let domains = try? JSONDecoder().decode([String].self, from: data) else {
            return []
        }
        return Set(domains.map { WebDomain(domain: $0) })
    }()

    func requestAuthorization() async -> [String: Any] {
        do {
            try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
            return ["status": "authorized"]
        } catch {
            return ["status": "denied", "error": error.localizedDescription]
        }
    }

    func checkAuthorization() -> [String: Any] {
        let status = AuthorizationCenter.shared.authorizationStatus
        switch status {
        case .approved:
            return ["status": "authorized", "familyControls": true]
        case .denied:
            return ["status": "denied", "familyControls": false]
        case .notDetermined:
            return ["status": "notDetermined", "familyControls": false]
        @unknown default:
            return ["status": "unsupported", "familyControls": false]
        }
    }

    func activateShield() -> [String: Any] {
        store.shield.webDomains = WebBlockerPlugin.blockedDomains
        return ["active": true]
    }

    func deactivateShield() -> [String: Any] {
        store.shield.webDomains = nil
        return ["active": false]
    }

    func openSettings() {
        DispatchQueue.main.async {
            if let url = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(url)
            }
        }
    }
}
