import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

  /* Función que devuelve los datos del telefono*/
const getPhoneData = async () => {
  /* Bucle para simular la espera de la respuesta*/
  for (let i = 0; i < 1000; i++) {
    console.log('procesando');
  }
  return {
    uuidDevice: 'uuidDevice',
    commonsParamsRequest: {
      appId: 'appId'
    },
    os: 'iOS',
    mobileEnrollmentKey: 'mobileEnrollmentKey',
    enrollmentType: 'enrollmentType'
  };
};

/* Función que simula la llamada al SDK
type: flag que determina el tipo de llamado al SDK
front: parte frontal del documento
back: parte posterior del documento
both: ambas partes del documento
face: rostro
*/
const callSDK = async (type: string) => {
  /* Bucle para simular la espera de la respuesta*/
  for (let i = 0; i < 1000; i++) {
    console.log('procesando');
  }
  if (type === 'front') {
    return {
      uploadDNIRequest: {},
      frontDni: 'base64'
    };
  }

  if (type === 'back') {
    return {
      backDni: 'base64'
    };
  }

  if (type === 'face') {
    return {
      uploadMatchFaceRequest: {},
      face: 'base64'
    };
  }

  return false;
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  link = 'https://mbaas.desa.cam.davivienda.com/front/index.html#/postMessages';
  urlSafe: SafeResourceUrl;
  status: string;

  constructor(
    private sanitizer: DomSanitizer,
  ) {
    window.addEventListener('message', (event) => {
      // Capturamos el hijo (mbaas front)
      const iframe = document.getElementById('contenedor');
      const contenedor = (iframe as HTMLIFrameElement).contentWindow;
      this.status = `Recibido postMessage::${event.data.event}`;
      // Un caso por cada postmessage
      switch (event.data.event) {
        case 'appReady':
          (async () => {
            try {
              // Llamamos a una función asincróna que devuelta los datos del telefono
              const response = await getPhoneData();
              // Llamamos el postmessage equivalente en el mbaas front
              contenedor.postMessage({
                event: 'appReady',
                response,
              }, '*');
            } catch (err) {
              return false;
            }
          })();
          break;
        case 'setTitle':
          // Colocamos el titulo que pasa el embebido por postmessage y lo ponemos al span
          document.getElementById('title').innerHTML = event.data.title;
          break;
        case 'captureBackDocument':
          (async () => {
            // Llamamos a la función asincróna que simula al SDK
            const response = await callSDK('back');
            contenedor.postMessage({
              event: 'captureBackDocument',
              response
            }, '*');
          })();
          break;
        case 'captureFrontDocument':
          (async () => {
            // Llamamos a la función asincróna que simula al SDK
            const response = await callSDK('front');
            contenedor.postMessage({
              event: 'captureFrontDocument',
              response
            }, '*');
          })();
          break;
        case 'captureFace':
          (async () => {
            // Llamamos a la función asincróna que simula al SDK
            const response = await callSDK('face');
            contenedor.postMessage({
              event: 'captureFace',
              response
            }, '*');
          })();
          break;
        case 'appFinish':
          (async () => {
            // Cerramos el embebido y colocamos mensaje de felicitaciones
            this.link = 'https://davtools.now.sh/';
            this.onPresentar();
          })();
          break;
      }
    });
  }

  async onPresentar() {
    this.status = `Espera mientras se carga`;
    try {
      this.urlSafe = await this.sanitizer.bypassSecurityTrustResourceUrl(this.link);
      this.link = 'https://mbaas.desa.cam.davivienda.com/front/index.html#/postMessages';
      this.status = `Espera 5 segundos`;
      setTimeout(() => {
        this.status = `Ya puedes probar postMessages`;
      }, 5000);
    } catch (err) {
      this.status = `Error cargando:::${JSON.stringify(err)}`;
    }
  }
}
