package com.nutritrack.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarEmailRecuperacao(String emailDestino, String codigoDeRecuperacao) {
        SimpleMailMessage mensagem = new SimpleMailMessage();
        
        // Coloque o e-mail que você usou para gerar a senha de App
        mensagem.setFrom("seu_email_aqui@gmail.com"); 
        
        mensagem.setTo(emailDestino);
        mensagem.setSubject("Recuperação de Senha - NutriTrack");
        mensagem.setText("Olá!\n\nVocê solicitou a recuperação de senha no NutriTrack.\n\n"
                + "Seu código de verificação é: " + codigoDeRecuperacao + "\n\n"
                + "Use este código no aplicativo para cadastrar sua nova senha.\n"
                + "Se você não solicitou isso, por favor, ignore este e-mail.");

        mailSender.send(mensagem);
    }
}