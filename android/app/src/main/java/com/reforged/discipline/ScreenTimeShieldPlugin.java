package com.reforged.discipline;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Process;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.accessibility.AccessibilityManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.List;

/**
 * Android counterpart to the iOS FamilyControls bridge.
 *
 * Real blocking on Android is delivered through:
 *   1. An AccessibilityService that observes foreground browser activity
 *      and intercepts blocked domains.
 *   2. Usage Access (PACKAGE_USAGE_STATS) so we can detect launched apps.
 *
 * Both permissions are user-granted in system Settings (not via a runtime
 * dialog), so this plugin exposes:
 *   - checkPermissions()         -> reports both permission states
 *   - requestAuthorization()     -> unified status mirroring iOS surface
 *   - openAccessibilitySettings()-> system intent into Accessibility menu
 *   - openUsageAccessSettings()  -> system intent into "Apps with usage access"
 */
@CapacitorPlugin(name = "ScreenTimeShield")
public class ScreenTimeShieldPlugin extends Plugin {

    private static final String ACCESSIBILITY_SERVICE_NAME =
        "com.reforged.discipline/.ReforgedAccessibilityService";

    private boolean hasAccessibilityPermission() {
        Context ctx = getContext();
        try {
            int enabled = Settings.Secure.getInt(
                ctx.getContentResolver(),
                Settings.Secure.ACCESSIBILITY_ENABLED
            );
            if (enabled != 1) return false;
            String list = Settings.Secure.getString(
                ctx.getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            );
            if (TextUtils.isEmpty(list)) return false;
            for (String component : list.split(":")) {
                if (component.equalsIgnoreCase(ACCESSIBILITY_SERVICE_NAME)) return true;
            }
            return false;
        } catch (Settings.SettingNotFoundException e) {
            return false;
        }
    }

    private boolean hasUsageAccessPermission() {
        Context ctx = getContext();
        try {
            AppOpsManager appOps = (AppOpsManager) ctx.getSystemService(Context.APP_OPS_SERVICE);
            if (appOps == null) return false;
            int mode;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                mode = appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    ctx.getPackageName()
                );
            } else {
                mode = appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    ctx.getPackageName()
                );
            }
            return mode == AppOpsManager.MODE_ALLOWED;
        } catch (Exception e) {
            return false;
        }
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("accessibility", hasAccessibilityPermission());
        ret.put("usageAccess", hasUsageAccessPermission());
        call.resolve(ret);
    }

    @PluginMethod
    public void requestAuthorization(PluginCall call) {
        boolean a = hasAccessibilityPermission();
        boolean u = hasUsageAccessPermission();
        JSObject ret = new JSObject();
        // Unified status mirrors the iOS surface so JS can branch generically.
        ret.put("status", (a && u) ? "authorized" : "denied");
        ret.put("accessibility", a);
        ret.put("usageAccess", u);
        call.resolve(ret);
    }

    @PluginMethod
    public void openAccessibilitySettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Unable to open Accessibility settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openUsageAccessSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try {
                getContext().startActivity(intent);
            } catch (Exception inner) {
                // Some OEMs reject the package URI; fall back to the global list.
                Intent fallback = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(fallback);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Unable to open Usage Access settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void activateShield(PluginCall call) {
        boolean ready = hasAccessibilityPermission() && hasUsageAccessPermission();
        JSObject ret = new JSObject();
        if (!ready) {
            ret.put("active", false);
            ret.put("reason", "permissions_missing");
            call.resolve(ret);
            return;
        }
        // TODO: bind AccessibilityService / start VpnService DNS sinkhole.
        ret.put("active", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void deactivateShield(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("active", false);
        call.resolve(ret);
    }
}
