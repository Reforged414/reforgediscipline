import Foundation
import Capacitor

@objc(WebBlockerPluginPlugin)
public class WebBlockerPluginPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WebBlockerPluginPlugin"
    public let jsName = "WebBlockerPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "activateShield", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deactivateShield", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise)
    ]

    private let implementation = WebBlockerPlugin()

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        Task {
            let result = await implementation.requestAuthorization()
            call.resolve(result)
        }
    }

    @objc func checkAuthorization(_ call: CAPPluginCall) {
        let result = implementation.checkAuthorization()
        call.resolve(result)
    }

    @objc func activateShield(_ call: CAPPluginCall) {
        let result = implementation.activateShield()
        call.resolve(result)
    }

    @objc func deactivateShield(_ call: CAPPluginCall) {
        let result = implementation.deactivateShield()
        call.resolve(result)
    }

    @objc func openSettings(_ call: CAPPluginCall) {
        implementation.openSettings()
        call.resolve(["opened": true])
    }
}
