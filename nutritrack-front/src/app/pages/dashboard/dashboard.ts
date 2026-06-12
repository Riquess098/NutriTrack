import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <-- Garantido o HttpHeaders aqui
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  usuario: any = { nome: '' };
  metaSalva: number = 2000;
  totalConsumido: number = 0;
  caloriasRestantes: number = 2000;
  porcentagemConsumida: number = 0;

  tipoSelecionado: string = 'Café da Manhã';
  termoBusca: string = '';
  resultadosBusca: any[] = [];
  isBrowser: boolean;

  historicoCompleto: any[] = [];
  refeicoesFiltradas: any[] = [];
  periodoAtual: string = 'diario';
  metaPeriodo: number = 2000;

  estaCarregando: boolean = false;
  
  // Variáveis do Calendário, Detalhes e Comunidade
  mostrandoCalendario: boolean = false;
  diasDoCalendario: any[] = [];
  anoAtualCalendario: number = new Date().getFullYear();
  
  mostrandoDetalhesDia: boolean = false;
  diaSelecionadoTexto: string = '';
  totalCaloriasDiaSelecionado: number = 0;
  refeicoesDoDia: any = { 'Café da Manhã': [], 'Almoço': [], 'Lanche': [], 'Jantar': [] };

  mostrandoComunidade: boolean = false; 

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef 
  ) {
    this.isBrowser = typeof window !== 'undefined' && !!window.document;
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const userLocal = localStorage.getItem('nutritrack_user');
    if (userLocal) {
      this.usuario = JSON.parse(userLocal);
      if (this.usuario.metaDiaria) {
        this.metaSalva = this.usuario.metaDiaria;
      } else {
        const metaLocal = localStorage.getItem('nutritrack_meta_diaria');
        if (metaLocal) this.metaSalva = parseInt(metaLocal, 10);
      }
      this.carregarHistoricoDoBanco();
    } else {
      this.router.navigate(['/login']);
    }
  }

  private getHeaders() {
    return new HttpHeaders()
      .set('bypass-tunnel-reminder', 'true')
      .set('ngrok-skip-browser-warning', 'true');
  }

  mostrarNotificacao(titulo: string, tipo: 'success' | 'error' | 'info') {
    Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      .fire({ icon: tipo, title: titulo });
  }

  carregarHistoricoDoBanco() {
    this.http.get<any[]>(` http://localhost:8080/api/refeicoes/usuario/${this.usuario.id}`, { headers: this.getHeaders() })
      .subscribe({
        next: (dados: any) => { 
          this.historicoCompleto = dados ? dados : []; 
          try {
            this.filtrarPeriodo('diario'); 
            this.verificarInatividade();
          } catch (e) {
            console.error("Erro interno ao renderizar períodos:", e);
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => { console.error("Erro ao conectar com Back-end Java:", err); }
      });
  }

  verificarInatividade() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (this.historicoCompleto.length === 0) return;

    let ultimaData = new Date(0);
    this.historicoCompleto.forEach((ref: any) => {
      let d = Array.isArray(ref.dataRegistro) ? new Date(ref.dataRegistro[0], ref.dataRegistro[1] - 1, ref.dataRegistro[2]) : new Date(ref.dataRegistro);
      if (d > ultimaData) ultimaData = d;
    });

    const hoje = new Date();
    ultimaData.setHours(0,0,0,0);
    hoje.setHours(0,0,0,0);
    
    const diffTempo = hoje.getTime() - ultimaData.getTime();
    const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));

    const ultimaNotificacao = localStorage.getItem('ultima_notif_inativa');
    const dataHojeStr = hoje.toDateString();
    if (ultimaNotificacao === dataHojeStr) return; 

    let mensagem = '';
    if (diffDias >= 30) {
      mensagem = 'Um mês sumido! A essa altura o projeto verão já virou projeto Papai Noel. Vai voltar ou não? 🎅🍔';
    } else if (diffDias >= 7) {
      mensagem = 'Uma semana inteira sem registrar nada. Depois não adianta culpar a genética, hein? 🧬👀';
    } else if (diffDias >= 1) {
      mensagem = 'Sumiu por quê? Já furou a dieta hoje ou só "esqueceu" de anotar a pizza? 🤡🍕';
    }

    if (mensagem !== '') {
      new Notification('NutriTrack de Olho em Você 👀', { body: mensagem });
      localStorage.setItem('ultima_notif_inativa', dataHojeStr); 
    }
  }

  filtrarPeriodo(periodo: string) {
    this.periodoAtual = periodo;
    const hoje = new Date();
    this.refeicoesFiltradas = this.historicoCompleto.filter((ref: any) => {
      let dataRef = Array.isArray(ref.dataRegistro) ? new Date(ref.dataRegistro[0], ref.dataRegistro[1] - 1, ref.dataRegistro[2]) : new Date(ref.dataRegistro);
      if (periodo === 'diario') { this.metaPeriodo = this.metaSalva; return dataRef.toDateString() === hoje.toDateString(); }
      else if (periodo === 'semanal') { this.metaPeriodo = this.metaSalva * 7; const sem = new Date(); sem.setDate(hoje.getDate() - 7); return dataRef >= sem; }
      else if (periodo === 'mensal') { this.metaPeriodo = this.metaSalva * 30; return dataRef.getMonth() === hoje.getMonth(); }
      return true;
    });
    this.totalConsumido = this.refeicoesFiltradas.reduce((total: number, ref: any) => total + (Number(ref.calorias) || 0), 0);
    this.atualizarCaloriasRestantes();
    this.cdr.detectChanges();
  }

  buscarAlimento() {
    if (!this.termoBusca.trim()) { this.resultadosBusca = []; return; }
    this.http.get<any[]>(` http://localhost:8080/api/alimentos/buscar?nome=${this.termoBusca}`, { headers: this.getHeaders() })
      .subscribe({
        next: (resultado: any) => { 
          this.resultadosBusca = resultado; 
          this.cdr.detectChanges();
        },
        error: (err: any) => { console.error(err); }
      });
  }

  adicionarAoPrato(nome: string, caloriasKcal: number) {
    this.resultadosBusca = []; 
    this.termoBusca = '';
    this.http.post(` http://localhost:8080/api/refeicoes/${this.usuario.id}`, { nomeAlimento: nome, calorias: caloriasKcal, tipoRefeicao: this.tipoSelecionado }, { headers: this.getHeaders() })
      .subscribe({
        next: (res: any) => { 
          this.carregarHistoricoDoBanco(); 
          this.mostrarNotificacao('Registrado com sucesso!', 'success'); 
        },
        error: (err: any) => { Swal.fire('Erro', 'Não foi possível salvar.', 'error'); }
      });
  }

  excluirRefeicao(idDaRefeicao: number) {
    Swal.fire({ title: 'Tem certeza?', text: "Esta refeição será removida permanentemente.", icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim, excluir!', confirmButtonColor: '#dc3545', cancelButtonText: 'Cancelar' }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(` http://localhost:8080/api/refeicoes/${idDaRefeicao}`, { headers: this.getHeaders() }).subscribe({
          next: (res: any) => { 
            this.carregarHistoricoDoBanco(); 
            Swal.fire('Excluído!', 'Removido com sucesso.', 'success'); 
          },
          error: (err: any) => { Swal.fire('Erro', 'Ocorreu um erro.', 'error'); }
        });
      }
    });
  }

  abrirCalendario() {
    this.mostrandoCalendario = true;
    const hoje = new Date();
    this.anoAtualCalendario = hoje.getFullYear();
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const datasRegistradas = new Set<string>();
    this.historicoCompleto.forEach((ref: any) => {
      let d = Array.isArray(ref.dataRegistro) ? new Date(ref.dataRegistro[0], ref.dataRegistro[1] - 1, ref.dataRegistro[2]) : new Date(ref.dataRegistro);
      if (d.getFullYear() === this.anoAtualCalendario) {
        datasRegistradas.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });

    this.diasDoCalendario = [];
    for (let m = 0; m < 12; m++) {
      const diasNoMes = new Date(this.anoAtualCalendario, m + 1, 0).getDate();
      const diasLista = [];
      for (let i = 1; i <= diasNoMes; i++) {
        const chave = `${this.anoAtualCalendario}-${m}-${i}`;
        diasLista.push({ dia: i, registrado: datasRegistradas.has(chave) });
      }
      this.diasDoCalendario.push({ nome: nomesMeses[m], dias: diasLista });
    }
    this.cdr.detectChanges();
  }

  verDetalhesDia(ano: number, mes: number, dia: number) {
    this.refeicoesDoDia = { 'Café da Manhã': [], 'Almoço': [], 'Lanche': [], 'Jantar': [] };
    this.totalCaloriasDiaSelecionado = 0;

    const dataBusca = new Date(ano, mes, dia).toDateString();
    
    const diaFormatado = dia < 10 ? '0' + dia : dia;
    const mesFormatado = (mes + 1) < 10 ? '0' + (mes + 1) : (mes + 1);
    this.diaSelecionadoTexto = `${diaFormatado}/${mesFormatado}/${ano}`;

    const refeicoesDesteDia = this.historicoCompleto.filter(ref => {
      let d = Array.isArray(ref.dataRegistro) ? new Date(ref.dataRegistro[0], ref.dataRegistro[1] - 1, ref.dataRegistro[2]) : new Date(ref.dataRegistro);
      return d.toDateString() === dataBusca;
    });

    refeicoesDesteDia.forEach(ref => {
      if (this.refeicoesDoDia[ref.tipoRefeicao]) {
        this.refeicoesDoDia[ref.tipoRefeicao].push(ref);
      } else {
        this.refeicoesDoDia[ref.tipoRefeicao] = [ref]; 
      }
      this.totalCaloriasDiaSelecionado += (Number(ref.calorias) || 0);
    });

    this.mostrandoDetalhesDia = true;
  }

  abrirComunidade() {
    this.mostrandoComunidade = true;
  }

  compartilharProgresso() {
    const elemento = document.getElementById('canvas-para-foto');
    if (!elemento) return;
    elemento.style.display = 'block';
    setTimeout(() => {
      html2canvas(elemento, { useCORS: true, scale: 2, backgroundColor: null }).then((canvas) => {
        const dataUrl = canvas.toDataURL('image/png');
        elemento.style.display = 'none';
        const link = document.createElement('a');
        link.download = `NutriTrack-Progresso-${this.periodoAtual}.png`;
        link.href = dataUrl;
        link.click();
        this.mostrarNotificacao('Imagem salva no dispositivo!', 'success');
      }).catch(err => {
        console.error("Erro ao gerar imagem:", err);
        elemento.style.display = 'none';
        Swal.fire('Erro', 'Não foi possível gerar a imagem.', 'error');
      });
    }, 150);
  }

  extrairKcal(alim: any): number { return alim.calorias || alim.kcal || 0; }
  atualizarCaloriasRestantes() { this.caloriasRestantes = this.metaPeriodo - this.totalConsumido; this.porcentagemConsumida = this.metaPeriodo > 0 ? Math.min((this.totalConsumido / this.metaPeriodo) * 100, 100) : 0; }
  getBadgeColor(tipo: string): string { switch(tipo) { case 'Café da Manhã': return '#2196F3'; case 'Almoço': return '#4CAF50'; case 'Jantar': return '#9C27B0'; case 'Lanche': return '#FF9800'; default: return '#6c757d'; } }
  sair() { localStorage.clear(); this.router.navigate(['/login']); }
}