package com.margelo.nitro.cactus

import android.os.Build
import android.provider.Settings
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise

class HybridCactusDeviceInfo : HybridCactusDeviceInfoSpec() {
  private val context = NitroModules.applicationContext ?: error("Android context not found")

  override fun getAppIdentifier(): Promise<String?> = Promise.async { context.packageName }

  override fun getDeviceInfo(): Promise<DeviceInfo> =
    Promise.async {
      DeviceInfo(
        brand = Build.MANUFACTURER,
        model = Build.MODEL,
        device_id =
          Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ANDROID_ID,
          ),
        os = "Android",
        os_version = Build.VERSION.RELEASE,
      )
    }
}
