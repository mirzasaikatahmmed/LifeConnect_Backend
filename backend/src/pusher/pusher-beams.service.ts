import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const PushNotifications = require('@pusher/push-notifications-server');

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, any>;
}

@Injectable()
export class PusherBeamsService {
  private beamsClient: any;

  constructor(private configService: ConfigService) {
    const instanceId = this.configService.get<string>('PUSHER_BEAMS_INSTANCE_ID');
    const secretKey = this.configService.get<string>('PUSHER_BEAMS_SECRET_KEY');

    if (!instanceId || !secretKey) {
      console.warn(
        'Pusher Beams not configured. Please set PUSHER_BEAMS_INSTANCE_ID and PUSHER_BEAMS_SECRET_KEY environment variables.',
      );
      return;
    }

    this.beamsClient = new PushNotifications({
      instanceId: instanceId,
      secretKey: secretKey,
    });
  }

  // Send notification to admin users
  async sendToAdmins(payload: NotificationPayload) {
    if (!this.beamsClient) {
      console.warn('Pusher Beams client not initialized');
      return;
    }

    try {
      const publishResponse = await this.beamsClient.publishToInterests(
        ['admin-notifications'],
        {
          web: {
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: payload.data || {},
          },
        },
      );

      console.log('Notification sent to admins:', publishResponse);
      return publishResponse;
    } catch (error) {
      console.error('Failed to send notification to admins:', error);
      throw error;
    }
  }

  // Send notification to a specific admin user
  async sendToAdminUser(userId: string, payload: NotificationPayload) {
    if (!this.beamsClient) {
      console.warn('Pusher Beams client not initialized');
      return;
    }

    try {
      const publishResponse = await this.beamsClient.publishToInterests(
        [`admin-user-${userId}`],
        {
          web: {
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: payload.data || {},
          },
        },
      );

      console.log(`Notification sent to admin user ${userId}:`, publishResponse);
      return publishResponse;
    } catch (error) {
      console.error(`Failed to send notification to admin user ${userId}:`, error);
      throw error;
    }
  }

  // Send notification to multiple interests
  async sendToInterests(interests: string[], payload: NotificationPayload) {
    if (!this.beamsClient) {
      console.warn('Pusher Beams client not initialized');
      return;
    }

    try {
      const publishResponse = await this.beamsClient.publishToInterests(
        interests,
        {
          web: {
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: payload.data || {},
          },
        },
      );

      console.log(`Notification sent to interests ${interests.join(', ')}:`, publishResponse);
      return publishResponse;
    } catch (error) {
      console.error(`Failed to send notification to interests ${interests.join(', ')}:`, error);
      throw error;
    }
  }

  // Send notification about new user registration
  async notifyNewUserRegistration(userData: any) {
    const payload: NotificationPayload = {
      title: 'New User Registration',
      body: `${userData.name} has registered with email ${userData.email}`,
      data: {
        type: 'user_registration',
        userId: userData.id,
        userEmail: userData.email,
      },
    };

    return this.sendToAdmins(payload);
  }

  // Send notification about blood request
  async notifyBloodRequest(requestData: any) {
    const payload: NotificationPayload = {
      title: 'New Blood Request',
      body: `Urgent ${requestData.bloodType} blood needed at ${requestData.location}`,
      data: {
        type: 'blood_request',
        requestId: requestData.id,
        bloodType: requestData.bloodType,
        location: requestData.location,
      },
    };

    return this.sendToAdmins(payload);
  }

  // Send notification about system alert
  async notifySystemAlert(alertData: any) {
    const payload: NotificationPayload = {
      title: 'System Alert',
      body: alertData.message,
      data: {
        type: 'system_alert',
        alertId: alertData.id,
        priority: alertData.priority,
      },
    };

    return this.sendToAdmins(payload);
  }
}