'use strict';

var core = require('@tauri-apps/api/core');

// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * Send toast notifications (brief auto-expiring OS window element) to your user.
 * Can also be used with the Notification Web API.
 *
 * @module
 */
/**
 * The unit of the repeating interval used by {@link Schedule.every}.
 */
exports.ScheduleEvery = void 0;
(function (ScheduleEvery) {
    /**
     * The notification repeats every year.
     *
     * On Android a year is approximated as 52 weeks.
     */
    ScheduleEvery["Year"] = "year";
    /**
     * The notification repeats every month.
     *
     * On Android a month is approximated as 30 days.
     */
    ScheduleEvery["Month"] = "month";
    /**
     * The notification repeats every two weeks.
     */
    ScheduleEvery["TwoWeeks"] = "twoWeeks";
    /**
     * The notification repeats every week.
     */
    ScheduleEvery["Week"] = "week";
    /**
     * The notification repeats every day.
     */
    ScheduleEvery["Day"] = "day";
    /**
     * The notification repeats every hour.
     */
    ScheduleEvery["Hour"] = "hour";
    /**
     * The notification repeats every minute.
     */
    ScheduleEvery["Minute"] = "minute";
    /**
     * The notification repeats every second.
     *
     * Not supported on iOS, where repeating triggers must be at least a minute apart.
     */
    ScheduleEvery["Second"] = "second";
})(exports.ScheduleEvery || (exports.ScheduleEvery = {}));
/**
 * Defines when a scheduled notification is delivered.
 *
 * Build one with the static {@link Schedule.at}, {@link Schedule.interval} and
 * {@link Schedule.every} helpers, then pass it to the `schedule` option of a notification.
 * Scheduling is only supported on mobile; desktop notifications are always shown immediately.
 *
 * @since 2.0.0
 */
class Schedule {
    /**
     * Creates a schedule that fires the notification at the given date and time.
     *
     * @example
     * ```typescript
     * import { Schedule, sendNotification } from '@tauri-apps/plugin-notification';
     * const schedule = Schedule.at(new Date(Date.now() + 60 * 1000));
     * sendNotification({ title: 'Tauri', body: 'One minute later', schedule });
     * ```
     *
     * @param date The date and time the notification fires at. It must be in the future.
     * @param repeating Whether the notification keeps repeating, using the duration between the moment it is scheduled and `date` as the interval. The interval must be at least one minute on iOS.
     * @param allowWhileIdle Whether the notification is allowed to fire while the device is in low-power idle (Doze) mode. Android only.
     *
     * @returns A schedule that can be assigned to the `schedule` option of a notification.
     */
    static at(date, repeating = false, allowWhileIdle = false) {
        return {
            at: { date, repeating, allowWhileIdle },
            interval: undefined,
            every: undefined
        };
    }
    /**
     * Creates a schedule that fires the notification whenever the current date matches
     * every field set on the given interval.
     *
     * @example
     * ```typescript
     * import { Schedule, sendNotification } from '@tauri-apps/plugin-notification';
     * // fires every day at 9:00
     * const schedule = Schedule.interval({ hour: 9, minute: 0 });
     * sendNotification({ title: 'Tauri', body: 'Good morning', schedule });
     * ```
     *
     * @param interval The date fields the current date must match for the notification to fire.
     * @param allowWhileIdle Whether the notification is allowed to fire while the device is in low-power idle (Doze) mode. Android only.
     *
     * @returns A schedule that can be assigned to the `schedule` option of a notification.
     */
    static interval(interval, allowWhileIdle = false) {
        return {
            at: undefined,
            interval: { interval, allowWhileIdle },
            every: undefined
        };
    }
    /**
     * Creates a schedule that repeatedly fires the notification, once every `count` interval units.
     *
     * @example
     * ```typescript
     * import { Schedule, ScheduleEvery, sendNotification } from '@tauri-apps/plugin-notification';
     * const schedule = Schedule.every(ScheduleEvery.Hour, 2);
     * sendNotification({ title: 'Tauri', body: 'Every two hours', schedule });
     * ```
     *
     * @param kind The unit of the repeating interval.
     * @param count How many interval units elapse between each notification.
     * @param allowWhileIdle Whether the notification is allowed to fire while the device is in low-power idle (Doze) mode. Android only.
     *
     * @returns A schedule that can be assigned to the `schedule` option of a notification.
     */
    static every(kind, count, allowWhileIdle = false) {
        return {
            at: undefined,
            interval: undefined,
            every: { interval: kind, count, allowWhileIdle }
        };
    }
}
/**
 * How much the notifications of a {@link Channel} interrupt the user.
 *
 * It maps to the Android `NotificationManager.IMPORTANCE_*` constants and is only used on Android.
 */
exports.Importance = void 0;
(function (Importance) {
    /**
     * The notifications are not shown.
     */
    Importance[Importance["None"] = 0] = "None";
    /**
     * The notifications are only shown in the shade, below the fold, without a status bar icon.
     */
    Importance[Importance["Min"] = 1] = "Min";
    /**
     * The notifications are shown without a sound.
     */
    Importance[Importance["Low"] = 2] = "Low";
    /**
     * The notifications are shown and make a sound.
     *
     * This is the value used when the channel does not define an importance.
     */
    Importance[Importance["Default"] = 3] = "Default";
    /**
     * The notifications are shown, make a sound and pop up as a heads-up notification.
     */
    Importance[Importance["High"] = 4] = "High";
})(exports.Importance || (exports.Importance = {}));
/**
 * How much of a notification is shown on the lock screen.
 *
 * It maps to the Android `Notification.VISIBILITY_*` constants and is only used on Android.
 */
exports.Visibility = void 0;
(function (Visibility) {
    /**
     * The notification is not shown on the lock screen at all.
     */
    Visibility[Visibility["Secret"] = -1] = "Secret";
    /**
     * The notification is shown on the lock screen with its sensitive content hidden.
     *
     * This is the value used when the channel does not define a visibility.
     */
    Visibility[Visibility["Private"] = 0] = "Private";
    /**
     * The notification is shown in full on the lock screen.
     */
    Visibility[Visibility["Public"] = 1] = "Public";
})(exports.Visibility || (exports.Visibility = {}));
/**
 * Checks if the permission to send notifications is granted.
 * @example
 * ```typescript
 * import { isPermissionGranted } from '@tauri-apps/plugin-notification';
 * const permissionGranted = await isPermissionGranted();
 * ```
 *
 * @returns A promise resolving to whether the permission to send notifications is granted.
 *
 * @since 2.0.0
 */
async function isPermissionGranted() {
    if (window.Notification.permission !== 'default') {
        return await Promise.resolve(window.Notification.permission === 'granted');
    }
    return await core.invoke('plugin:notification|is_permission_granted');
}
/**
 * Requests the permission to send notifications.
 * @example
 * ```typescript
 * import { isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';
 * let permissionGranted = await isPermissionGranted();
 * if (!permissionGranted) {
 *   const permission = await requestPermission();
 *   permissionGranted = permission === 'granted';
 * }
 * ```
 *
 * @returns A promise resolving to whether the user granted the permission or not.
 *
 * @since 2.0.0
 */
async function requestPermission() {
    return await window.Notification.requestPermission();
}
/**
 * Sends a notification to the user.
 * @example
 * ```typescript
 * import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
 * let permissionGranted = await isPermissionGranted();
 * if (!permissionGranted) {
 *   const permission = await requestPermission();
 *   permissionGranted = permission === 'granted';
 * }
 * if (permissionGranted) {
 *   sendNotification('Tauri is awesome!');
 *   sendNotification({ title: 'TAURI', body: 'Tauri is awesome!' });
 * }
 * ```
 *
 * @param options The notification content, or the notification title when a string is given.
 *
 * @since 2.0.0
 */
function sendNotification(options) {
    if (typeof options === 'string') {
        new window.Notification(options);
    }
    else {
        new window.Notification(options.title, options);
    }
}
/**
 * Register actions that are performed when the user clicks on the notification.
 *
 * @example
 * ```typescript
 * import { registerActionTypes } from '@tauri-apps/plugin-notification';
 * await registerActionTypes([{
 *   id: 'tauri',
 *   actions: [{
 *     id: 'my-action',
 *     title: 'Settings'
 *   }]
 * }])
 * ```
 *
 * @param types The action types to register.
 *
 * @returns A promise indicating the success or failure of the operation.
 *
 * @since 2.0.0
 */
async function registerActionTypes(types) {
    await core.invoke('plugin:notification|register_action_types', { types });
}
/**
 * Retrieves the list of pending notifications.
 *
 * @example
 * ```typescript
 * import { pending } from '@tauri-apps/plugin-notification';
 * const pendingNotifications = await pending();
 * ```
 *
 * @returns A promise resolving to the list of pending notifications.
 *
 * @since 2.0.0
 */
async function pending() {
    return await core.invoke('plugin:notification|get_pending');
}
/**
 * Cancels the pending notifications with the given list of identifiers.
 *
 * @example
 * ```typescript
 * import { cancel } from '@tauri-apps/plugin-notification';
 * await cancel([-34234, 23432, 4311]);
 * ```
 *
 * @param notifications The identifiers of the pending notifications to cancel.
 *
 * @returns A promise indicating the success or failure of the operation.
 *
 * @since 2.0.0
 */
async function cancel(notifications) {
    await core.invoke('plugin:notification|cancel', { notifications });
}
/**
 * Cancels all pending notifications.
 *
 * @example
 * ```typescript
 * import { cancelAll } from '@tauri-apps/plugin-notification';
 * await cancelAll();
 * ```
 *
 * @returns A promise indicating the success or failure of the operation.
 *
 * @since 2.0.0
 */
async function cancelAll() {
    await core.invoke('plugin:notification|cancel');
}
/**
 * Retrieves the list of active notifications.
 *
 * @example
 * ```typescript
 * import { active } from '@tauri-apps/plugin-notification';
 * const activeNotifications = await active();
 * ```
 *
 * @returns A promise resolving to the list of active notifications.
 *
 * @since 2.0.0
 */
async function active() {
    return await core.invoke('plugin:notification|get_active');
}
/**
 * Removes the active notifications with the given list of identifiers.
 *
 * @example
 * ```typescript
 * import { removeActive } from '@tauri-apps/plugin-notification';
 * await removeActive([{ id: -34234 }, { id: 23432 }, { id: 4311 }])
 * ```
 *
 * @param notifications The active notifications to remove, identified by their id and, on Android, their optional tag.
 *
 * @returns A promise indicating the success or failure of the operation.
 *
 * @since 2.0.0
 */
async function removeActive(notifications) {
    await core.invoke('plugin:notification|remove_active', { notifications });
}
/**
 * Removes all active notifications.
 *
 * @example
 * ```typescript
 * import { removeAllActive } from '@tauri-apps/plugin-notification';
 * await removeAllActive()
 * ```
 *
 * @returns A promise indicating the success or failure of the operation.
 *
 * @since 2.0.0
 */
async function removeAllActive() {
    await core.invoke('plugin:notification|remove_active');
}
/**
 * Creates a notification channel.
 *
 * @example
 * ```typescript
 * import { createChannel, Importance, Visibility } from '@tauri-apps/plugin-notification';
 * await createChannel({
 *   id: 'new-messages',
 *   name: 'New Messages',
 *   lights: true,
 *   vibration: true,
 *   importance: Importance.Default,
 *   visibility: Visibility.Private
 * });
 * ```
 *
 * @param channel The channel to create.
 *
 * @returns A promise indicating the success or failure of the operation.
 *
 * @since 2.0.0
 */
async function createChannel(channel) {
    await core.invoke('plugin:notification|create_channel', { ...channel });
}
/**
 * Removes the channel with the given identifier.
 *
 * @example
 * ```typescript
 * import { removeChannel } from '@tauri-apps/plugin-notification';
 * await removeChannel('new-messages');
 * ```
 *
 * @param id The identifier of the channel to remove.
 *
 * @returns A promise indicating the success or failure of the operation.
 *
 * @since 2.0.0
 */
async function removeChannel(id) {
    await core.invoke('plugin:notification|delete_channel', { id });
}
/**
 * Retrieves the list of notification channels.
 *
 * @example
 * ```typescript
 * import { channels } from '@tauri-apps/plugin-notification';
 * const notificationChannels = await channels();
 * ```
 *
 * @returns A promise resolving to the list of notification channels.
 *
 * @since 2.0.0
 */
async function channels() {
    return await core.invoke('plugin:notification|list_channels');
}
/**
 * Listens to notifications that are delivered while the app is running.
 *
 * Only emitted on mobile.
 *
 * @example
 * ```typescript
 * import { onNotificationReceived } from '@tauri-apps/plugin-notification';
 * const unlisten = await onNotificationReceived((notification) => {
 *   console.log(`received notification: ${notification.title}`);
 * });
 * ```
 *
 * @param cb The closure called with the notification that was delivered.
 *
 * @returns A promise resolving to a listener that can be used to stop listening for the event.
 *
 * @since 2.0.0
 */
async function onNotificationReceived(cb) {
    return await core.addPluginListener('notification', 'notification', cb);
}
/**
 * Listens to the actions the user performs on a notification.
 *
 * Only emitted on mobile, for notifications that reference an action type
 * registered with {@link registerActionTypes}.
 *
 * @example
 * ```typescript
 * import { onAction } from '@tauri-apps/plugin-notification';
 * const unlisten = await onAction((notification) => {
 *   console.log(`user acted on notification: ${notification.title}`);
 * });
 * ```
 *
 * @param cb The closure called with the notification the action was performed on.
 *
 * @returns A promise resolving to a listener that can be used to stop listening for the event.
 *
 * @since 2.0.0
 */
async function onAction(cb) {
    return await core.addPluginListener('notification', 'actionPerformed', cb);
}

exports.Schedule = Schedule;
exports.active = active;
exports.cancel = cancel;
exports.cancelAll = cancelAll;
exports.channels = channels;
exports.createChannel = createChannel;
exports.isPermissionGranted = isPermissionGranted;
exports.onAction = onAction;
exports.onNotificationReceived = onNotificationReceived;
exports.pending = pending;
exports.registerActionTypes = registerActionTypes;
exports.removeActive = removeActive;
exports.removeAllActive = removeAllActive;
exports.removeChannel = removeChannel;
exports.requestPermission = requestPermission;
exports.sendNotification = sendNotification;
