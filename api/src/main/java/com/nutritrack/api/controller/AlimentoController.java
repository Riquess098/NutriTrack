package com.nutritrack.api.controller;

import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alimentos")
@CrossOrigin(origins = "*")
public class AlimentoController {

    @SuppressWarnings("unchecked")
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarAlimentos(@RequestParam String nome) {
        System.out.println("\n--- REQUISIÇÃO TACO (Chave Corrigida) ---");
        System.out.println("Buscando por: " + nome);

        List<Map<String, Object>> resultadosFiltrados = new ArrayList<>();
        RestTemplate restTemplate = new RestTemplate();
        String urlExterno = "https://raw.githubusercontent.com/marcelosanto/tabela_taco/master/tabela_alimentos.json";
        
        try {
            String jsonPuro = restTemplate.getForObject(urlExterno, String.class);
            
            if (jsonPuro != null) {
                JsonParser parser = JsonParserFactory.getJsonParser();
                List<Object> todosAlimentos = parser.parseList(jsonPuro);
                
                for (Object obj : todosAlimentos) {
                    if (obj instanceof Map) {
                        Map<String, Object> alimento = (Map<String, Object>) obj;
                        
                        String nomeAlimento = "";
                        if (alimento.containsKey("nome") && alimento.get("nome") != null) {
                            nomeAlimento = alimento.get("nome").toString();
                        } else if (alimento.containsKey("description") && alimento.get("description") != null) {
                            nomeAlimento = alimento.get("description").toString();
                        }
                        
                        if (nomeAlimento.toLowerCase().contains(nome.toLowerCase())) {
                            Map<String, Object> itemFormatado = new HashMap<>();
                            itemFormatado.put("description", nomeAlimento);
                            
                            // Extrai e arredonda o valor calórico real detectado (energy_kcal)
                            int kcalArredondado = extrairEArredondarKcal(alimento);
                            itemFormatado.put("calorias", kcalArredondado);
                            
                            resultadosFiltrados.add(itemFormatado);
                        }
                    }
                }
                System.out.println("Busca concluída. Retornando " + resultadosFiltrados.size() + " itens com Kcal.");
            }
            
        } catch (Exception e) {
            System.out.println("ERRO NO CONTROLADOR: " + e.getMessage());
            resultadosFiltrados = obterBancoBackup(nome);
        }
        
        return ResponseEntity.ok(resultadosFiltrados);
    }

    private int extrairEArredondarKcal(Map<String, Object> alimento) {
        Object valor = null;
        
        // Mapeamento com a chave real identificada no log: 'energy_kcal'
        String[] chavesPlanas = {"energy_kcal", "calorias", "kcal", "energia", "energia_kcal"};
        for (String chave : chavesPlanas) {
            if (alimento.containsKey(chave) && alimento.get(chave) != null) {
                valor = alimento.get(chave);
                break;
            }
        }

        if (valor != null) {
            try {
                // Remove qualquer string de texto residual e converte para double para poder arredondar
                String strValor = valor.toString().replaceAll("[^0-9.]", "");
                if (!strValor.isEmpty()) {
                    double d = Double.parseDouble(strValor);
                    return (int) Math.round(d); // Transforma 123.534 em 124
                }
            } catch (Exception e) {
                return 0;
            }
        }
        return 0;
    }

    private List<Map<String, Object>> obterBancoBackup(String nome) {
        List<Map<String, Object>> backup = new ArrayList<>();
        adicionarBackup(backup, "Pão Francês", 265);
        adicionarBackup(backup, "Arroz Branco Cozido", 128);
        adicionarBackup(backup, "Feijão Carioca Cozido", 76);
        adicionarBackup(backup, "Peito de Frango Grelhado", 159);
        adicionarBackup(backup, "Ovo Cozido", 155);
        
        List<Map<String, Object>> filtrados = new ArrayList<>();
        for (Map<String, Object> alim : backup) {
            if (alim.get("description").toString().toLowerCase().contains(nome.toLowerCase())) {
                filtrados.add(alim);
            }
        }
        return filtrados;
    }

    private void adicionarBackup(List<Map<String, Object>> lista, String nome, int kcal) {
        Map<String, Object> map = new HashMap<>();
        map.put("description", nome);
        map.put("calorias", kcal);
        lista.add(map);
    }
}