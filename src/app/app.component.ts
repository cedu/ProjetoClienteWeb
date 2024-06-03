import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule, //biblioteca de formulários do Angular
    ReactiveFormsModule, //biblioteca de formulários do Angular
    CommonModule,
    NgxSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {

  //variável para armazenar o endereço da API
  endpoint: string = 'http://localhost:5147/api/clientes/';

  clientes: any[] = [];
  mensagemErro: string = '';

  //variável para exibir mensagem de sucesso ao cadastrar um cliente
  mensagemCadastro: string = '';

  formConsulta = new FormGroup({
    nome: new FormControl('', [Validators.required,
    Validators.minLength(5), Validators.maxLength(100)]),
  });

  formCadastro = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]),
    email: new FormControl('', [Validators.required]),
    cpf: new FormControl('', [Validators.required, Validators.maxLength(14)])
  });

  formEdicao = new FormGroup({
    id: new FormControl(''),
    nome: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]),
    email: new FormControl('', [Validators.required]),
    cpf: new FormControl('', [Validators.required, Validators.maxLength(14)])
  });

  //função auxiliar para que possamos exibir as mensagens de erro de validação do formConsulta

  get fConsulta() {
    return this.formConsulta.controls;
  }

  //função auxiliar para que possamos exibir as
  //mensagens de erro de validação do formCadastro
  get fCadastro() {
    return this.formCadastro.controls;
  }

  //função auxiliar para que possamos exibir as
  //mensagens de erro de validação do formEdicao
  get fEdicao() {
    return this.formEdicao.controls;
  }

  constructor(
    private httpClient: HttpClient,
    private spinner: NgxSpinnerService
  ) { }

  pesquisarClientes(): void {
    
    this.spinner.show();
    
    // Capturar o nome preenchido
    const nome = this.formConsulta.value?.nome ?? '';

    // Verificar se o nome foi preenchido
    if (nome.trim() === '') {
      this.mensagemErro = 'Por favor, informe o nome do cliente.';
      this.spinner.hide();
      return;
    }
    // Montar os parâmetros de consulta
    let params = new HttpParams().set('nome', nome);

    // Fazer a requisição para a API GET: /api/clientes
    this.httpClient.get(this.endpoint, { params })
      .subscribe({
        next: (dados) => {
          console.log(dados);
          this.clientes = dados as any[]; // Assumindo que 'dados' é um array de clientes
          this.spinner.hide();
        },
        error: (e) => {
          console.error(e.error);
          // Defina uma mensagem de erro personalizada baseada na resposta da API, se necessário
          this.mensagemErro = 'Erro ao pesquisar clientes.';
        }
      });

  }

  //função para executar o cadastro do cliente
  cadastrarCliente(): void {
    this.spinner.show();
    this.httpClient.post(this.endpoint, this.formCadastro.value).subscribe({
      next: (data) => {
        //console.log(data);
        this.mensagemCadastro = 'Cliente cadastrado com sucesso.';
        this.formCadastro.reset();
        this.spinner.hide();
      },
      error: (e) => {
        console.log(e.error);
      }
    });
  }

  //função para excluir o cliente
  excluirCliente(id: string): void {
    //pedindo confirmação do usuário
    if (confirm('Deseja realmente excluir este cliente selecionado?')) {
      //excluir o cliente
      this.httpClient.delete(this.endpoint + id).subscribe({
        next: (data: any) => {
          alert('Cliente excluído com sucesso!');
          this.pesquisarClientes();
        },
        error: (e) => {
          console.log(e.error);
        }
      });
    }
  }

  //função para exibir os dados do cliente selecionado
  //para edição (ao clicar no botão Editar do GRID)

  obterCliente(cliente: any): void {
    this.formEdicao.controls['id'].setValue(cliente.id);
    this.formEdicao.controls['nome'].setValue(cliente.nome);
    this.formEdicao.controls['email'].setValue(cliente.email);
    this.formEdicao.controls['cpf'].setValue(cliente.cpf);
  }

  //função para atualizar o cliente quando o usuário
  //clicar no botão SUBMIT do formulário de edição

  editarCliente(): void {
    this.spinner.show();
    this.httpClient.put(this.endpoint, this.formEdicao.value)
      .subscribe({
        next: (data) => {
          alert('Cliente atualizado com sucesso.');
          this.pesquisarClientes();
          this.spinner.hide();
        },
        error: (e) => {
          console.log(e.error);
        }
      });
  }
}
