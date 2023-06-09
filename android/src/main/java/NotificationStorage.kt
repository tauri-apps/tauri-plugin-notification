// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

package app.tauri.notification

import android.content.Context
import android.content.SharedPreferences
import app.tauri.plugin.JSObject
import org.json.JSONException
import java.text.ParseException

// Key for private preferences
private const val NOTIFICATION_STORE_ID = "NOTIFICATION_STORE"
// Key used to save action types
private const val ACTION_TYPES_ID = "ACTION_TYPE_STORE"

class NotificationStorage(private val context: Context) {
  fun appendNotifications(localNotifications: List<Notification>) {
    val storage = getStorage(NOTIFICATION_STORE_ID)
    val editor = storage.edit()
    for (request in localNotifications) {
      if (request.isScheduled) {
        val key: String = request.id.toString()
        editor.putString(key, request.source.toString())
      }
    }
    editor.apply()
  }

  fun getSavedNotificationIds(): List<String> {
    val storage = getStorage(NOTIFICATION_STORE_ID)
    val all = storage.all
    return if (all != null) {
      ArrayList(all.keys)
    } else ArrayList()
  }

  fun getSavedNotifications(): List<Notification> {
    val storage = getStorage(NOTIFICATION_STORE_ID)
    val all = storage.all
    if (all != null) {
      val notifications = ArrayList<Notification>()
      for (key in all.keys) {
        val notificationString = all[key] as String?
        val jsNotification = getNotificationFromJSONString(notificationString)
        if (jsNotification != null) {
          try {
            val notification =
              Notification.fromJSObject(jsNotification)
            notifications.add(notification)
          } catch (_: ParseException) {
          }
        }
      }
      return notifications
    }
    return ArrayList()
  }

  private fun getNotificationFromJSONString(notificationString: String?): JSObject? {
    if (notificationString == null) {
      return null
    }
    val jsNotification = try {
      JSObject(notificationString)
    } catch (ex: JSONException) {
      return null
    }
    return jsNotification
  }

  fun getSavedNotificationAsJSObject(key: String?): JSObject? {
    val storage = getStorage(NOTIFICATION_STORE_ID)
    val notificationString = try {
      storage.getString(key, null)
    } catch (ex: ClassCastException) {
      return null
    } ?: return null
    
    val jsNotification = try {
      JSObject(notificationString)
    } catch (ex: JSONException) {
      return null
    }
    return jsNotification
  }

  fun getSavedNotification(key: String?): Notification? {
    val jsNotification = getSavedNotificationAsJSObject(key) ?: return null
    val notification = try {
      Notification.fromJSObject(jsNotification)
    } catch (ex: ParseException) {
      return null
    }
    return notification
  }

  fun deleteNotification(id: String?) {
    val editor = getStorage(NOTIFICATION_STORE_ID).edit()
    editor.remove(id)
    editor.apply()
  }

  private fun getStorage(key: String): SharedPreferences {
    return context.getSharedPreferences(key, Context.MODE_PRIVATE)
  }

  fun writeActionGroup(typesMap: Map<String, List<NotificationAction>>) {
    for ((id, notificationActions) in typesMap) {
      val editor = getStorage(ACTION_TYPES_ID + id).edit()
      editor.clear()
      editor.putInt("count", notificationActions.size)
      for (i in notificationActions.indices) {
        editor.putString("id$i", notificationActions[i].id)
        editor.putString("title$i", notificationActions[i].title)
        editor.putBoolean("input$i", notificationActions[i].input)
      }
      editor.apply()
    }
  }

  fun getActionGroup(forId: String): Array<NotificationAction?> {
    val storage = getStorage(ACTION_TYPES_ID + forId)
    val count = storage.getInt("count", 0)
    val actions: Array<NotificationAction?> = arrayOfNulls(count)
    for (i in 0 until count) {
      val id = storage.getString("id$i", "")
      val title = storage.getString("title$i", "")
      val input = storage.getBoolean("input$i", false)
      actions[i] = NotificationAction(id, title, input)
    }
    return actions
  }
}