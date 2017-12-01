import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Platform, AlertController } from 'ionic-angular';

@Injectable()
export class NotificationProvider {

  constructor(
    public http: Http,
    public push: Push,
    public alertCtrl: AlertController
  ) {
    console.log('Hello NotificationProvider Provider');
  }

  init(platform: Platform) {
    
    console.log("Inicializando Notification Provider ...");

    if (!platform.is('cordova')) {
      console.warn('Notificações apenas funcionarão no dispositivo físico.');
      return;
    }

    const options: PushOptions = {
      android: {},
      ios: {
        alert: 'true',
        badge: false,
        sound: 'true'
      },
      windows: {}
    };
    const pushObject: PushObject = this.push.init(options);

    pushObject.on('registration').subscribe((data: any) => {
      console.log('DEVICE_TOKEN -> ' + data.registrationId);
      //TODO - send device token to server
    });

    pushObject.on('notification').subscribe((data: any) => {
      console.log('mensagem -> ' + data.message);
      if (data.additionalData.foreground) {
        // Se o app estiver aberto no dispositivo, 
        // a notificação aparecerá como um popup
        let confirmAlert = this.alertCtrl.create({
          title: 'Nova notificação',
          message: data.message,
          buttons: [{
            text: 'Ignorar',
            role: 'cancel'
          }, {
            text: 'Visualizar',
            handler: () => {
              //TODO: INSERIR LÓGICA AO ABRIR A NOTIFICAÇÃO
            }
          }]
        });
        confirmAlert.present();
      } else {
        // Se o app não estiver aberto, a notificação aparecerá na barra superior
        //TODO: INSERIR LÓGICA AO CLICAR NA NOTIFICAÇÃO
        console.log('Notificação aberta');
      }
    });

    pushObject.on('error').subscribe(error => console.error('Error with Push plugin' + error));

  }
    

}
