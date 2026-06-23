/* ----------------------------------------------
   1. CONFIGURAÇÕES GERAIS E AUXILIARES
-----------------------------------------------*/

/* Formatação de valores numéricos para o padrão de moeda brasileiro (R$) */
function formatMoney(value) {
  if (typeof value !== "number") value = Number(value);
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/* Retorna o nome por extenso do mês com base no seu índice numérico */
function getMonthName(month) {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[month];
}

/* ----------------------------------------------
   2. GERENCIAMENTO DE TAREFAS
-----------------------------------------------*/

/* Calcula as métricas de tarefas pendentes, concluídas e atualiza a barra de progresso */
function updateTaskDashboard() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("taskCounter").textContent = pending;
  document.getElementById("completedCounter").textContent = completed;
  document.getElementById("progressText").textContent = progress + "%";
  document.getElementById("progressFill").style.width = progress + "%";
}

/* ----------------------------------------------
   3. MÓDULO GAMIFICAÇÃO (PLANTA E XP)
-----------------------------------------------*/

/* Define o emoji correspondente ao estágio atual de evolução da planta */
function getPlantStage(progress) {
  if (progress < 25) return "🌱";
  if (progress < 50) return "🌿";
  if (progress < 75) return "🪴";
  if (progress < 100) return "🌳";
  return "🌳✨";
}

/* Atualiza o emoji e o texto descritivo do estágio de crescimento da planta no painel */
function updatePlantDashboard() {
  const progress = Number(localStorage.getItem("currentPlantProgress")) || 0;
  const plant = localStorage.getItem("currentPlant") || "🌱";

  document.getElementById("plantStage").textContent = plant;

  let stageText = "";
  if (progress < 25) stageText = "Semente 🌱";
  else if (progress < 50) stageText = "Broto Inicial 🌿";
  else if (progress < 75) stageText = "Planta Jovem 🪴";
  else if (progress < 100) stageText = "Árvore Formada 🌳";
  else stageText = "Floresta Próspera 🌳✨";

  document.getElementById("plantProgress").textContent = stageText;
}

/* Sistema de XP e Nível: calcula o nível atual do usuário e atualiza a barra de experiência */
function updateLevelDashboard() {
  const xp = Number(localStorage.getItem("forestXP")) || 0;
  const level = Math.floor(xp / 100) + 1;
  const currentXP = xp % 100;

  document.getElementById("levelText").textContent = `Nível ${level}`;
  document.getElementById("xpText").textContent = `${currentXP} / 100 XP`;
  document.getElementById("levelFill").style.width = currentXP + "%";
}

/* ----------------------------------------------
   4. PAINEL FINANCEIRO
-----------------------------------------------*/

/* Filtra as finanças do mês corrente e exibe o total de entradas, saídas e o saldo final */
function updateFinanceDashboard() {
  const finances = JSON.parse(localStorage.getItem("finances")) || [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  let income = 0;
  let expense = 0;

  finances.forEach(finance => {
    const date = new Date(finance.date);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      if (finance.type === "income") {
        income += finance.value;
      } else {
        expense += finance.value;
      }
    }
  });

  const balance = income - expense;

  document.getElementById("financeMonth").textContent = `${getMonthName(currentMonth)} ${currentYear}`;
  document.getElementById("balanceText").textContent = formatMoney(balance);
  document.getElementById("incomeText").textContent = `📈 ${formatMoney(income)}`;
  document.getElementById("expenseText").textContent = `📉 ${formatMoney(expense)}`;
}

/* ----------------------------------------------
   5. PAINEL DE METAS
-----------------------------------------------*/

/* Renderiza o progresso geral das metas cadastradas, exibindo a porcentagem de conclusão */
function renderDashboardGoals() {
  const container = document.getElementById("dashboardGoalsContent");
  if (!container) return;

  const savedGoals = JSON.parse(localStorage.getItem("forestGoals")) || [];

  if (savedGoals.length === 0) {
    container.innerHTML = `<p style="color: #a0aec0; font-style: italic; margin: 0; font-size: 14px; text-align: center;">Nenhuma meta cadastrada ainda.</p__>`;
    return;
  }

  const completedCount = savedGoals.filter(g => g.current >= g.target).length;
  const totalGoals = savedGoals.length;
  const totalPercent = Math.round((completedCount / totalGoals) * 100);

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; width: 100%;">
      <span style="font-size: 14px; color: #fff; font-weight: 500; display: flex; align-items: center; gap: 6px;">
        📊 ${completedCount} de ${totalGoals} concluídas
      </span>
      <span style="font-size: 14px; color: #a78bfa; font-weight: bold;">
        ${totalPercent}%
      </span>
    </div>
    <div class="progress-bar" style="width: 100%; height: 6px; background: #2d2d44; border-radius: 3px; overflow: hidden; margin: 0;">
      <div style="width: ${totalPercent}%; height: 100%; background: #6366f1; transition: width 0.5s ease;"></div>
    </div>
  `;
}

/* ----------------------------------------------
   6. SISTEMA DE LEMBRETES (NOTIFICAÇÕES)
-----------------------------------------------*/

/* Função que pede permissão para enviar notificações e agenda os horários */
function configurarLembretes() {

  if (!('Notification' in window)) return;

  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('Permissão concedida! Agendando lembretes...');
      
      const alertas = [
        { id: 'manha', hora: 8, minuto: 0, titulo: 'Foco Inicial! 🚀', texto: 'Novo dia, novas metas. Abra o Forest Focus e organize suas prioridades.' },
        { id: 'tarde', hora: 14, minuto: 0, titulo: 'Check-in de Produtividade! 📊', texto: 'Não perca o ritmo! Dê uma olhada no que ainda falta concluir hoje.' },
        { id: 'noite', hora: 22, minuto: 0, titulo: 'Revisão Concluída? 🌳', texto: 'Hora de fechar a conta! Registre seus gastos antes de dormir e prepare o terreno para amanhã.' }
      ];

      navigator.serviceWorker.ready.then(registration => {
        alertas.forEach(alerta => {
          const agora = new Date();
          let momentoAlarme = new Date();
          
          momentoAlarme.setHours(alerta.hora, alerta.minuto, 0, 0);

          if (momentoAlarme <= agora) {
            momentoAlarme.setDate(momentoAlarme.getDate() + 1);
          }

          const tempoRestante = momentoAlarme.getTime() - agora.getTime();

          setTimeout(() => {
            registration.showNotification(alerta.titulo, {
              body: alerta.texto,
              icon: './assets/img/logo-192.png', 
              badge: './assets/img/favicon.png',
              tag: alerta.id
            });
          }, tempoRestante);
          
          console.log(`Alarme da ${alerta.id} programado para:`, momentoAlarme.toLocaleTimeString());
        });
      });
    }
  });
}

/* ----------------------------------------------
   7. GATILHO DE EXECUÇÃO
-----------------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {
  updateTaskDashboard();
  updateFinanceDashboard();
  updatePlantDashboard();
  updateLevelDashboard();
  renderDashboardGoals();
  configurarLembretes();
});