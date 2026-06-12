package com.nutritrack.api.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String email;
    private String senha;
    private Double peso;
    private Double altura;
    private Integer idade;
    private String sexo;
    private String activity;
    private String objetivo;
    
    // Campo para salvar a meta no banco
    private Integer metaDiaria;

    // NOVO CAMPO: Para salvar o código de 6 dígitos temporário
    private String codigoRecuperacao;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Refeicao> refeicoes;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }
    public Double getAltura() { return altura; }
    public void setAltura(Double altura) { this.altura = altura; }
    public Integer getIdade() { return idade; }
    public void setIdade(Integer idade) { this.idade = idade; }
    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }
    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }
    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }
    
    public Integer getMetaDiaria() { return metaDiaria; }
    public void setMetaDiaria(Integer metaDiaria) { this.metaDiaria = metaDiaria; }
    
    // Novos Getters e Setters do Código de Recuperação
    public String getCodigoRecuperacao() { return codigoRecuperacao; }
    public void setCodigoRecuperacao(String codigoRecuperacao) { this.codigoRecuperacao = codigoRecuperacao; }
    
    public List<Refeicao> getRefeicoes() { return refeicoes; }
    public void setRefeicoes(List<Refeicao> refeicoes) { this.refeicoes = refeicoes; }
}