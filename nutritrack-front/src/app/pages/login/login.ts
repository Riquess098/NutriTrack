import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <-- Atualizado
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credenciais = { email: '', senha: '' };

  etapaAtual: 'login' | 'solicitar' | 'redefinir' = 'login';
  emailRecuperacao: string = '';
  codigoDigitado: string = '';
  novaSenhaDigitada: string = '';

  constructor(
    private router: Router, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef 
  ) {}

  // Cria o header uma vez para ser usado em todas as requisições
  private getHeaders() {
    return new HttpHeaders()
      .set('bypass-tunnel-reminder', 'true')
      .set('ngrok-skip-browser-warning', 'true');
  }

 fazerLogin() {
    this.http.post<any>('http://localhost:8080/api/login', this.credenciais, { headers: this.getHeaders() })
      .subscribe({
        next: (resposta) => {
          if (resposta.sucesso) {
            localStorage.setItem('nutritrack_user', JSON.stringify(resposta.usuario));
            if (resposta.usuario.peso) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/questionario']);
            }
          }
        },
        error: (err) => {
          Swal.fire('Erro', 'E-mail ou senha incorretos.', 'error');
        }
      });
  }

  irParaEsqueciSenha(event: Event) {
    event.preventDefault(); 
    this.etapaAtual = 'solicitar';
    this.emailRecuperacao = this.credenciais.email; 
    this.cdr.detectChanges(); 
  }

  voltarParaLogin(event?: Event) {
    if (event) event.preventDefault();
    this.etapaAtual = 'login';
    this.codigoDigitado = '';
    this.novaSenhaDigitada = '';
    this.cdr.detectChanges(); 
  }

  enviarCodigo() {
    if (!this.emailRecuperacao) {
      Swal.fire('Aviso', 'Digite seu e-mail para receber o código.', 'warning');
      return;
    }
    
    this.http.post(' http://localhost:8080/api/auth/esqueci-senha', { email: this.emailRecuperacao }, { headers: this.getHeaders(), responseType: 'text' })
      .subscribe({
        next: (res) => {
          this.etapaAtual = 'redefinir';
          this.cdr.detectChanges(); 
          Swal.fire('E-mail enviado!', 'Verifique sua caixa de entrada (e o spam).', 'info');
        },
        error: (err) => {
          let mensagemErro = 'Não foi possível enviar o e-mail.';
          if (typeof err.error === 'string') mensagemErro = err.error;
          else if (err.error && err.error.message) mensagemErro = err.error.message;
          else if (err.status === 404) mensagemErro = 'Rota não encontrada. Você reiniciou o servidor Java?';
          Swal.fire('Erro', mensagemErro, 'error');
        }
      });
  }

  salvarNovaSenha() {
    if (!this.codigoDigitado || !this.novaSenhaDigitada) {
      Swal.fire('Aviso', 'Preencha o código que chegou no e-mail e a nova senha.', 'warning');
      return;
    }
    
    const payload = {
      email: this.emailRecuperacao,
      codigo: this.codigoDigitado,
      novaSenha: this.novaSenhaDigitada
    };

    // COMO DEVE FICAR (CORRETO):
this.http.post(' http://localhost:8080/api/auth/redefinir-senha', payload, { headers: this.getHeaders(), responseType: 'text' })
      .subscribe({
        next: (res) => {
          Swal.fire('Sucesso!', 'Sua senha foi redefinida. Faça login.', 'success');
          this.voltarParaLogin();
          this.credenciais.senha = ''; 
          this.credenciais.email = this.emailRecuperacao;
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          let mensagemErro = err.error || 'Código inválido ou expirado.';
          if (typeof err.error === 'object' && err.error !== null) mensagemErro = 'Ocorreu um erro ao redefinir a senha.';
          Swal.fire('Erro', mensagemErro, 'error');
        }
      });
  }
}