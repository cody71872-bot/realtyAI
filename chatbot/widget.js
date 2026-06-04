(function() {
  // Inject CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/widget/chatbot.css';
  document.head.appendChild(link);

  // Create Container
  const container = document.createElement('div');
  container.id = 'realtyai-chatbot-container';
  container.innerHTML = `
    <div id="realtyai-chat-window">
      <div id="realtyai-chat-header">
        <span>RealtyAI Assistant</span>
        <span id="realtyai-chat-close">&times;</span>
      </div>
      <div id="realtyai-chat-body">
        <form id="realtyai-chat-form">
          <input type="text" id="ra-name" placeholder="Full Name" required>
          <input type="email" id="ra-email" placeholder="Email Address" required>
          <input type="tel" id="ra-phone" placeholder="Phone Number">
          <select id="ra-type">
            <option value="">I am looking to...</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="both">Both</option>
          </select>
          <input type="text" id="ra-budget" placeholder="Budget (e.g. $500k)">
          <select id="ra-timeline">
            <option value="">Timeline</option>
            <option value="immediate">Immediate</option>
            <option value="1-3-months">1-3 Months</option>
            <option value="3-6-months">3-6 Months</option>
            <option value="6-plus">6+ Months</option>
          </select>
          <button type="submit">Get Started</button>
        </form>
      </div>
    </div>
    <div id="realtyai-chat-bubble">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </div>
  `;
  document.body.appendChild(container);

  const bubble = document.getElementById('realtyai-chat-bubble');
  const window = document.getElementById('realtyai-chat-window');
  const close = document.getElementById('realtyai-chat-close');
  const form = document.getElementById('realtyai-chat-form');
  const body = document.getElementById('realtyai-chat-body');

  bubble.onclick = () => {
    window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
  };

  close.onclick = () => {
    window.style.display = 'none';
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('ra-name').value,
      email: document.getElementById('ra-email').value,
      phone: document.getElementById('ra-phone').value,
      type: document.getElementById('ra-type').value,
      budget: document.getElementById('ra-budget').value,
      timeline: document.getElementById('ra-timeline').value
    };

    try {
      const response = await fetch('/api/chatbot/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        body.innerHTML = '<div class="realtyai-thanks"><h3>Thank you!</h3><p>An agent will reach out to you shortly.</p></div>';
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('RealtyAI Error:', err);
      alert('Error connecting to server.');
    }
  };
})();
