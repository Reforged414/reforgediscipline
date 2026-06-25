package com.reforged.discipline;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Skeleton counterpart to the iOS FamilyControls / ManagedSettings bridge.
 *
 * Android has no first-party equivalent to Screen Time, so production
 * blocking will route through a custom VpnService (DNS sinkhole) or the
 * Accessibility / UsageStats APIs. This placeholder simply mirrors the JS
 * surface so {@code useScreenTimeBlocker} can call the same methods on
 * both platforms.
 */
@CapacitorPlugin(name = "ScreenTimeShield")
public class ScreenTimeShieldPlugin extends Plugin {

    @PluginMethod
    public void requestAuthorization(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("status", "unsupported");
        call.resolve(ret);
    }

    @PluginMethod
    public void activateShield(PluginCall call) {
        // TODO: start VpnService-based DNS filter or AccessibilityService.
        JSObject ret = new JSObject();
        ret.put("active", false);
        ret.put("reason", "not_implemented");
        call.resolve(ret);
    }

    @PluginMethod
    public void deactivateShield(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("active", false);
        call.resolve(ret);
    }
}
