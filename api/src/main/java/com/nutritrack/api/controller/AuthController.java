package com.nutritrack.api.controller;

import com.nutritrack.api.model.Usuario;
import com.nutritrack.api.repository.UsuarioRepository;
import com.nutritrack.api.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Permissão do Angular com o CORS
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    // Situação/ rota 1: O usuário digita o e-mail para receber o código
    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> solicitarRecuperacao(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("E-mail não encontrado no sistema.");
        }

        Usuario usuario = usuarioOpt.get();
        
        // Gera um código aleatório de 6 dígitos 
        String codigo = String.format("%06d", new Random().nextInt(999999));
        
        // Salva o código temporário no banco de dados
        usuario.setCodigoRecuperacao(codigo);
        usuarioRepository.save(usuario);

        // Dispara o e-mail
        emailService.enviarEmailRecuperacao(usuario.getEmail(), codigo);

        return ResponseEntity.ok("Código de recuperação enviado para o e-mail.");
    }

    // Situação/ rota 2: O usuário digita o código e a nova senha
    @PostMapping("/redefinir-senha")
    public ResponseEntity<?> redefinirSenha(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String codigo = request.get("codigo");
        String novaSenha = request.get("novaSenha");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado.");
        }

        Usuario usuario = usuarioOpt.get();

        // Verifica se o código bate com o que foi salvo no banco
        if (usuario.getCodigoRecuperacao() == null || !usuario.getCodigoRecuperacao().equals(codigo)) {
            return ResponseEntity.badRequest().body("Código inválido ou expirado.");
        }

        //Atualiza a senha e apaga o código de recuperação por segurança
        usuario.setSenha(novaSenha);
        usuario.setCodigoRecuperacao(null);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Senha redefinida com sucesso! Você já pode fazer login.");
    }
}