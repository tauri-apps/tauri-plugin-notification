// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import Tauri
import UserNotifications

public class NotificationHandler: NSObject, NotificationHandlerProtocol {

  public weak var plugin: Plugin?

  private var notificationsMap = [String: JSObject]()

  public func saveNotification(_ key: String, _ notification: JSObject) {
    notificationsMap.updateValue(notification, forKey: key)
  }

  public func requestPermissions(with completion: ((Bool, Error?) -> Void)? = nil) {
    let center = UNUserNotificationCenter.current()
    center.requestAuthorization(options: [.badge, .alert, .sound]) { (granted, error) in
      completion?(granted, error)
    }
  }

  public func checkPermissions(with completion: ((UNAuthorizationStatus) -> Void)? = nil) {
    let center = UNUserNotificationCenter.current()
    center.getNotificationSettings { settings in
      completion?(settings.authorizationStatus)
    }
  }

  public func willPresent(notification: UNNotification) -> UNNotificationPresentationOptions {
    let notificationData = makeNotificationRequestJSObject(notification.request)
    self.plugin?.trigger("notification", data: notificationData)

    if let options = notificationsMap[notification.request.identifier] {
      let silent = options["silent"] as? Bool ?? false
      if silent {
        return UNNotificationPresentationOptions.init(rawValue: 0)
      }
    }

    return [
      .badge,
      .sound,
      .alert,
    ]
  }

  public func didReceive(response: UNNotificationResponse) {
    var data = JSObject()

    let originalNotificationRequest = response.notification.request
    let actionId = response.actionIdentifier

    // We turn the two default actions (open/dismiss) into generic strings
    if actionId == UNNotificationDefaultActionIdentifier {
      data["actionId"] = "tap"
    } else if actionId == UNNotificationDismissActionIdentifier {
      data["actionId"] = "dismiss"
    } else {
      data["actionId"] = actionId
    }

    // If the type of action was for an input type, get the value
    if let inputType = response as? UNTextInputNotificationResponse {
      data["inputValue"] = inputType.userText
    }

    data["notification"] = makeNotificationRequestJSObject(originalNotificationRequest)

    self.plugin?.trigger("actionPerformed", data: data)
  }

  /**
    * Turn a UNNotificationRequest into a JSObject to return back to the client.
    */
  func makeNotificationRequestJSObject(_ request: UNNotificationRequest) -> JSObject {
    let notificationRequest = notificationsMap[request.identifier] ?? [:]
    var notification = makePendingNotificationRequestJSObject(request)
    notification["sound"] = notificationRequest["sound"] ?? ""
    notification["actionTypeId"] = request.content.categoryIdentifier
    notification["attachments"] = notificationRequest["attachments"] ?? [JSObject]()
    return notification
  }

  func makePendingNotificationRequestJSObject(_ request: UNNotificationRequest) -> JSObject {
    var notification: JSObject = [
      "id": Int(request.identifier) ?? -1,
      "title": request.content.title,
      "body": request.content.body,
    ]

    if let userInfo = JSTypes.coerceDictionaryToJSObject(request.content.userInfo) {
      var extra = userInfo["__EXTRA__"] as? JSObject ?? userInfo

      // check for any dates and convert them to strings
      for (key, value) in extra {
        if let date = value as? Date {
          let dateString = ISO8601DateFormatter().string(from: date)
          extra[key] = dateString
        }
      }

      notification["extra"] = extra

      if var schedule = userInfo["__SCHEDULE__"] as? JSObject {
        // convert schedule at date to string
        if let date = schedule["at"] as? Date {
          let dateString = ISO8601DateFormatter().string(from: date)
          schedule["at"] = dateString
        }

        notification["schedule"] = schedule
      }
    }

    return notification
  }
}
