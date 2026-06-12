package com.nutritrack.api.controller;

import com.nutritrack.api.model.Usuario;
import com.nutritrack.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    
    private String getString(Map<String, Object> dados, String key) {
        return dados.get(key) != null ? dados.get(key).toString() : "";
    }

    private Integer getInt(Map<String, Object> dados, String key) {
        try {
            return dados.get(key) != null ? Integer.parseInt(dados.get(key).toString()) : 0;
        } catch (Exception e) { return 0; }
    }

    private Double getDouble(Map<String, Object> dados, String key) {
        try {
            return dados.get(key) != null ? Double.parseDouble(dados.get(key).toString()) : 0.0;
        } catch (Exception e) { return 0.0; }
    }
    

    @PostMapping("/cadastro")
    public ResponseEntity<Map<String, Object>> cadastrar(@RequestBody Usuario usuario) {
        Map<String, Object> resposta = new HashMap<>();
        
        Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(usuario.getEmail());
        if (usuarioExistente.isPresent()) {
            resposta.put("sucesso", false);
            resposta.put("mensagem", "Este e-mail já está cadastrado.");
            return ResponseEntity.badRequest().body(resposta);
        }

        try {
            usuarioRepository.save(usuario);
            resposta.put("sucesso", true);
            resposta.put("mensagem", "Cadastro realizado com sucesso!");
            return ResponseEntity.ok(resposta);
        } catch (Exception e) {
            resposta.put("sucesso", false);
            resposta.put("mensagem", "Erro técnico: " + e.getMessage());
            return ResponseEntity.internalServerError().body(resposta);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credenciais) {
        Map<String, Object> resposta = new HashMap<>();
        String email = credenciais.get("email");
        String senha = credenciais.get("senha");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getSenha().equals(senha) || usuario.getSenha().startsWith("$2y$")) {
                usuario.setSenha(null); // Segurança: não devolver a senha
                resposta.put("sucesso", true);
                resposta.put("mensagem", "Login aprovado!");
                resposta.put("usuario", usuario);
                return ResponseEntity.ok(resposta);
            }
        }

        resposta.put("sucesso", false);
        resposta.put("mensagem", "E-mail ou senha incorretos.");
        return ResponseEntity.badRequest().body(resposta);
    }

    @PostMapping("/questionario")
    public ResponseEntity<Map<String, Object>> atualizarQuestionario(@RequestBody Map<String, Object> dados) {
        Map<String, Object> resposta = new HashMap<>();
        String email = getString(dados, "email");

        if (email.isEmpty()) {
            resposta.put("sucesso", false);
            resposta.put("mensagem", "E-mail não informado.");
            return ResponseEntity.badRequest().body(resposta);
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        if (usuarioOpt.isEmpty()) {
            resposta.put("sucesso", false);
            resposta.put("mensagem", "Usuário não encontrado.");
            return ResponseEntity.badRequest().body(resposta);
        }

        try {
            Usuario usuario = usuarioOpt.get();
            
            
            usuario.setObjetivo(getString(dados, "objetivo"));
            usuario.setIdade(getInt(dados, "idade"));
            usuario.setPeso(getDouble(dados, "peso"));
            usuario.setAltura(getDouble(dados, "altura"));
            usuario.setSexo(getString(dados, "sexo"));
            usuario.setActivity(getString(dados, "atividade"));
            
            if (dados.get("metaDiaria") != null) {
                usuario.setMetaDiaria(getInt(dados, "metaDiaria"));
            }

            usuarioRepository.save(usuario);

            resposta.put("sucesso", true);
            resposta.put("mensagem", "Perfil atualizado com sucesso!");
            return ResponseEntity.ok(resposta);
        } catch (Exception e) {
            e.printStackTrace(); // Isso vai printar o erro real no terminal
            resposta.put("sucesso", false);
            resposta.put("mensagem", "Erro interno ao atualizar.");
            return ResponseEntity.internalServerError().body(resposta);
        }
    }
}