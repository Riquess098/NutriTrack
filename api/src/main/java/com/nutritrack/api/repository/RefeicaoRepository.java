package com.nutritrack.api.repository;

import com.nutritrack.api.model.Refeicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RefeicaoRepository extends JpaRepository<Refeicao, Long> {
    // Adicionado o underline (Usuario_Id) para o Spring mapear com perfeição
    List<Refeicao> findByUsuario_IdOrderByDataRegistroDesc(Long usuarioId);
}