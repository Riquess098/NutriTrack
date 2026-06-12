package com.nutritrack.api.controller;

import com.nutritrack.api.model.Refeicao;
import com.nutritrack.api.model.Usuario;
import com.nutritrack.api.repository.RefeicaoRepository;
import com.nutritrack.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/refeicoes")
@CrossOrigin(origins = "*") 
public class RefeicaoController {

    @Autowired
    private RefeicaoRepository refeicaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // 1. Rota antiga que já criamos para salvar a refeição
    @PostMapping("/{usuarioId}")
    public ResponseEntity<Refeicao> registrarRefeicao(@PathVariable Long usuarioId, @RequestBody Refeicao novaRefeicao) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        novaRefeicao.setUsuario(usuario);
        Refeicao salva = refeicaoRepository.save(novaRefeicao);
        return ResponseEntity.ok(salva);
    }

   // 2. NOVA ROTA: Buscar o histórico completo do usuário (Atende ao RF15)
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Refeicao>> listarHistorico(@PathVariable Long usuarioId) {
        // Chamando o método com o nome blindado
        List<Refeicao> historico = refeicaoRepository.findByUsuario_IdOrderByDataRegistroDesc(usuarioId);
        return ResponseEntity.ok(historico);
    }
    // 3. NOVA ROTA: Excluir uma refeição do histórico
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarRefeicao(@PathVariable Long id) {
        // Manda o banco apagar a refeição com esse ID específico
        refeicaoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}