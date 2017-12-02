Como enviar notificações para o app Android desenvolvido em Ionic
===================================================

### Passo a passo:

Criar app (conectar ao Cordova durante a instalação ou depois):

```
ionic start pje-push blank
```

Instalar plugin:

```
ionic cordova plugin add phonegap-plugin-push
```

Instalar android (rodar comando como administrador):

```
ionic cordova platform add android
```

Registrar o app no Firebase:

https://console.firebase.google.com/

Na página do projeto no Firebase, adicionar app Android (package name deve ser o mesmo do projeto, presente no atributo `id` do widget em `config.xml`), baixar o `google-services.json` e colocar na raiz do projeto e no diretório `\platforms\android`.

Ainda na página do projeto no Firebase, obter o SENDER_ID e adicioná-lo no `package.json`:

```json
"cordova": {
    "plugins": {
      "phonegap-plugin-push": {
        "SENDER_ID": "<SENDER_ID>"
      },
      ...
    }
}
```

E no `config.xml`:

```xml
<plugin name="phonegap-plugin-push" spec="^2.2.1">
    <variable name="SENDER_ID" value="<SENDER_ID>" />
</plugin>
```

Instalar o Push:

```
npm install @ionic-native/push --save
```

Criar provider para as notificações (se necessário, adicionar no `app.module.ts`):

```
ionic generate provider notification
```

```typescript
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Platform } from 'ionic-angular';

/*
  Generated class for the NotificationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NotificationProvider {

  constructor(
    public http: Http,
    public push: Push
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

  }

}
```

Adicionar ao `app.module.ts` o `HttpModule`, o `Push` e, se necessário, o `NotificatioProvider`:

```typescript
...
import { HttpModule } from '@angular/http';
import { NotificationProvider } from '../providers/notification/notification';
...
  imports: [
    ...
    HttpModule,
    ...
  ],
  ...
  providers: [
    ...
    Push,
    NotificationProvider
  ]
...
```

Executar o app no aplicativo em forma de debug:

```
ionic cordova run android -l -c
```

Obter o device token do console:

```
[13:27:24]  console.log: Initializing Notification Provider ...
[13:27:24]  console.log: DEVICE_TOKEN -> <DEVICE_TOKEN>
            
```

Criar o Aplicativo Servidor (Java) e adicionar o SERVER_KEY (Do Firebase) e o DEVICE_TOKEN:

```java
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class AndroidPush {

    private static String SERVER_KEY = "SERVER_KEY";
    private static String DEVICE_TOKEN = "DEVICE_TOKEN";

    public static void main(String[] args) throws Exception {
        String titulo = "Esta é uma notificação";
        String mensagem = "Esta notificação foi enviada pelo Servidor por meio do Firebase";
        enviarNotificacao(titulo, mensagem);
    }

    private static void enviarNotificacao(String titulo, String mensagem) throws Exception {
        String notificacao = 
        		"{" + 
        			"\"data\":" + "{" + 
        				"\"title\":\"" + titulo + "\"," + 
        				"\"message\":\"" + mensagem +
        			"\"}," +
        			"\"to\":\"" + DEVICE_TOKEN + "\"" +
        		"}";
        /* Formato da notificação: 
    		{ 
    			"data": {
    				"title": titulo, 
    				"message": mensagem
    			},
    			"to": DEVICE_TOKEN
    		}
         */
        
        // Criar conexão com o FCM (firebase)
        URL url = new URL("https://fcm.googleapis.com/fcm/send");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestProperty("Authorization", "key=" + SERVER_KEY);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);

        // Enviar notificação ao FCM
        OutputStream outputStream = conn.getOutputStream();
        outputStream.write(notificacao.getBytes());

        System.out.println(conn.getResponseCode());
        System.out.println(conn.getResponseMessage());
    }
}
```

Adicionar código ao `Notification Provider` para aceitar as notificações:

```typescript
...
import { Platform, AlertController } from 'ionic-angular';
...
  constructor(
    public http: Http,
    public push: Push,
    public alertCtrl: AlertController
  ) ...
  ...
  init(platform: Platform) {
    ...
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
```

Executar o app no dispositivo móvel e Servidor para enviar notificação.




Publicações utilizadas como referência:

*  https://github.com/phonegap/phonegap-plugin-push/blob/master/docs/INSTALLATION.md#compilation
*  https://medium.com/@ankushaggarwal/gcm-setup-for-android-push-notifications-656cfdd8adbd
*  https://medium.com/@ankushaggarwal/push-notifications-in-ionic-2-658461108c59
