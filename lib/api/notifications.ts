import { request } from './common';

export interface UserNotificationPreferences {
    id?: string;
    userId: string;
    notificationType: string;
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart?: string; // HH:mm:ss
    quietHoursEnd?: string;
    language: string;
}

export interface UpdateNotificationPreferencesRequest {
    notificationType: string;
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    language?: string;
}

export interface NotificationResponse {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    status: string;
    createdAt: string;
    read?: boolean; // If we add read status later
}

/**
 * Get user preferences
 */
export async function getPreferences(userId: string): Promise<UserNotificationPreferences[]> {
    return request<UserNotificationPreferences[]>(`/notifications/preferences/${userId}`, {
        method: 'GET',
    });
}

/**
 * Update user preferences
 */
export async function updatePreferences(userId: string, data: UpdateNotificationPreferencesRequest): Promise<UserNotificationPreferences> {
    return request<UserNotificationPreferences>(`/notifications/preferences/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Get notification history
 */
export async function getNotifications(userId: string, page = 0, size = 20): Promise<NotificationResponse[]> {
    return request<NotificationResponse[]>(`/notifications/history/${userId}?page=${page}&size=${size}`, {
        method: 'GET',
    });
}
