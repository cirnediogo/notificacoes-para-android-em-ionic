import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class AndroidPush {

    private static String SERVER_KEY = "SERVER_KEY";
    private static String DEVICE_TOKEN = "DEVICE_TOKEN";

    public static void main(String[] args) throws Exception {
        String titulo = "Esta � uma notifica��o";
        String mensagem = "Esta notifica��o foi enviada pelo Servidor por meio do Firebase";
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
        /* Formato da notifica��o: 
    		{ 
    			"data": {
    				"title": titulo, 
    				"message": mensagem
    			},
    			"to": DEVICE_TOKEN
    		}
         */
        
        // Criar conex�o com o FCM (firebase)
        URL url = new URL("https://fcm.googleapis.com/fcm/send");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestProperty("Authorization", "key=" + SERVER_KEY);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);

        // Enviar notifica��o ao FCM
        OutputStream outputStream = conn.getOutputStream();
        outputStream.write(notificacao.getBytes());

        System.out.println(conn.getResponseCode());
        System.out.println(conn.getResponseMessage());
    }
}