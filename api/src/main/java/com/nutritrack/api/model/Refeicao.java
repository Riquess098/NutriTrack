package com.nutritrack.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore; // Importação adicionada aqui
import java.time.LocalDateTime;

@Entity
@Table(name = "refeicoes")
public class Refeicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeAlimento;
    private Integer calorias;
    private String tipoRefeicao; // Ex: "Café da Manhã"
    private LocalDateTime dataRegistro;

    // Relacionamento N para 1 (Muitas refeições pertencem a um usuário)
    @JsonIgnore // A mágica acontece aqui: impede o erro de StackOverflow na hora de devolver o JSON
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // Construtor para definir a data automaticamente
    @PrePersist
    protected void onCreate() {
        dataRegistro = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomeAlimento() { return nomeAlimento; }
    public void setNomeAlimento(String nomeAlimento) { this.nomeAlimento = nomeAlimento; }
    public Integer getCalorias() { return calorias; }
    public void setCalorias(Integer calorias) { this.calorias = calorias; }
    public String getTipoRefeicao() { return tipoRefeicao; }
    public void setTipoRefeicao(String tipoRefeicao) { this.tipoRefeicao = tipoRefeicao; }
    public LocalDateTime getDataRegistro() { return dataRegistro; }
    public void setDataRegistro(LocalDateTime dataRegistro) { this.dataRegistro = dataRegistro; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
}