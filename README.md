<h1 align="center">Atividade 1 — Mocks e Injeção de Dependência</h1>

Projeto da disciplina com a implementação dos testes unitários em <code>server/test/</code>.

<h2>O que foi implementado</h2>

<p>Nove arquivos de teste unitário, conforme o README do projeto (que está em <code>atvividade-aula2-aluno/atvividade-aula2-aluno/README.md</code>):</p>

<pre><code>server/test/
├── validation.test.ts
├── database/
│   ├── unique-violation.test.ts
│   └── foreign-key-violation.test.ts
└── modules/
    ├── courses/
    │   ├── courses.service.test.ts
    │   └── courses.repository.test.ts
    ├── students/
    │   ├── students.service.test.ts
    │   └── students.repository.test.ts
    └── enrollments/
        ├── enrollments.service.test.ts
        └── enrollments.repository.test.ts
</code></pre>

<h2>Cobertura dos cenários</h2>

<ul>
  <li><strong>Validações</strong> (52 testes): <code>positiveInteger</code>, <code>parseId</code>, <code>validateName</code>, <code>validateBody</code>, <code>isUniqueViolation</code>, <code>isForeignKeyViolation</code>.</li>
  <li><strong>Serviços</strong> (54 testes): <code>CoursesService</code>, <code>StudentsService</code>, <code>EnrollmentsService</code>, com repositório falso (<code>jest.Mocked&lt;...&gt;</code>) usando <strong>stub</strong>, <strong>mock</strong> e <strong>spy</strong>.</li>
  <li><strong>Repositórios</strong> (24 testes): <code>PgCourseRepository</code>, <code>PgStudentRepository</code>, <code>PgEnrollmentRepository</code>, com <code>Database</code> falso (<code>{ query: jest.fn&lt;Database["query"]&gt;() }</code>).</li>
</ul>

<h2>Resultados</h2>

<table>
  <thead>
    <tr>
      <th align="left">Comando</th>
      <th align="left">Resultado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>npm test</code></td>
      <td><strong>9 suites, 106 testes, todos passando</strong></td>
    </tr>
    <tr>
      <td><code>npm run test:coverage</code></td>
      <td>100% nos 10 arquivos de escopo</td>
    </tr>
    <tr>
      <td><code>npm run test:typecheck</code></td>
      <td>sem erros</td>
    </tr>
    <tr>
      <td><code>npm run build</code></td>
      <td>sem erros</td>
    </tr>
  </tbody>
</table>

<h2>Como executar</h2>

<pre><code>cd atvividade-aula2-aluno/atvividade-aula2-aluno/server
npm ci
npm test
</code></pre>


