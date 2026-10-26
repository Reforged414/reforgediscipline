package com.reforged.discipline

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.util.Log

class AppBlockerService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString() ?: return

            if (isShieldActive() && isAppBlocked(packageName)) {
                val intent = Intent(this, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    putExtra("BLOCKED_PACKAGE", packageName)
                }
                startActivity(intent)
            }
        }
    }

    override fun onInterrupt() {
        Log.d("AppBlockerService", "Service interrupted")
    }

    private fun isShieldActive(): Boolean {
        val prefs = getSharedPreferences("ReforgedPrefs", MODE_PRIVATE)
        return prefs.getBoolean("is_shield_active", false)
    }

    private fun isAppBlocked(packageName: String): Boolean {
        val prefs = getSharedPreferences("ReforgedPrefs", MODE_PRIVATE)
        val blockedList = prefs.getStringSet("blocked_apps", emptySet()) ?: emptySet()
        if (packageName == "com.reforged.discipline") return false
        return blockedList.contains(packageName)
    }
}