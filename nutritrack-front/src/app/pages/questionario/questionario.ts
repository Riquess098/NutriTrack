import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <-- Atualizado

@Component({
  selector: 'app-questionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questionario.html',
  styleUrls: ['./questionario.css']
})
export class QuestionarioComponent {
  dados = { objetivo: '', idade: null, peso: null, altura: null, sexo: 'male', atividade: '' };
  mostrarModal = false;
  gastoCaloricoTotal = 0;
  ajusteDeficit = '0';
  metaFinal = 0;

  constructor(private router: Router, private http: HttpClient) {}

  calcularGastoCalorico() {
    if (!this.dados.peso || !this.dados.altura || !this.dados.idade) return;

    let tmb = 0;
    if (this.dados.sexo === 'male') {
      tmb = 88.362 + (13.397 * this.dados.peso) + (4.799 * this.dados.altura) - (5.677 * this.dados.idade);
    } else {
      tmb = 447.593 + (9.247 * this.dados.peso) + (3.098 * this.dados.altura) - (4.330 * this.dados.idade);
    }

    const niveis: { [key: string]: number } = { min: 1.2, low: 1.375, medium: 1.55, high: 1.725, max: 1.9 };
    const fator = niveis[this.dados.atividade] || 1.2;
    this.gastoCaloricoTotal = Math.round(tmb * fator);
    this.metaFinal = this.gastoCaloricoTotal + parseInt(this.ajusteDeficit, 10);
    this.mostrarModal = true;
  }

  atualizarMetaFinal() {
    this.metaFinal = this.gastoCaloricoTotal + parseInt(this.ajusteDeficit, 10);
  }

 salvarMetaFinal() {
    const userLocal = localStorage.getItem('nutritrack_user');
    if (!userLocal) return;
    const usuarioLogado = JSON.parse(userLocal);
    const payload = { ...this.dados, email: usuarioLogado.email };

    // Sem barra dupla aqui
    this.http.post<any>('http://localhost:8080/api/questionario', payload)
      .subscribe({
        next: () => {
          localStorage.setItem('nutritrack_meta_diaria', this.metaFinal.toString());
          this.router.navigate(['/dashboard']);
        },
        error: (err) => { 
          console.error(err);
          alert('Erro ao salvar. Verifique se o servidor Java está rodando.'); 
        }
      });
    }}