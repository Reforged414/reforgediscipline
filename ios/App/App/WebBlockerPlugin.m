#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Registers the Swift `WebBlockerPlugin` class with the Capacitor bridge so
// JavaScript can call into it via `Capacitor.Plugins.WebBlockerPlugin.<method>`.
//
// The CAP_PLUGIN_METHOD macros MUST match the @objc func selectors declared in
// WebBlockerPlugin.swift, otherwise the web layer will report
// "method not implemented" at runtime.
CAP_PLUGIN(WebBlockerPlugin, "WebBlockerPlugin",
    CAP_PLUGIN_METHOD(requestAuthorization, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(checkAuthorization, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(activateShield, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(deactivateShield, CAPPluginReturnPromise);
)
