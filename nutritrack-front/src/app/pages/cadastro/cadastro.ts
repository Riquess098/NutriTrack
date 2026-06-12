import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <-- Atualizado

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.css']
})
export class CadastroComponent {
  usuario = { nome: '', email: '', senha: '' };
  confirmaSenha = '';

  constructor(private router: Router, private http: HttpClient) {}

  cadastrar() {
    if (this.usuario.senha !== this.confirmaSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    // CABEÇALHO DO PASSE LIVRE
    const headers = new HttpHeaders()
      .set('bypass-tunnel-reminder', 'true')
      .set('ngrok-skip-browser-warning', 'true');

    this.http.post<any>(' http://localhost:8080/api/cadastro', this.usuario, { headers })
      .subscribe({
        next: (resposta) => {
          alert(resposta.mensagem);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          alert(err.error?.mensagem || 'Erro ao realizar cadastro.');
        }
      });
  }
}