/* Common JS for theme, booking logic and small helpers */
document.addEventListener('DOMContentLoaded', () => {
  // Set years in footers
  const year = new Date().getFullYear();
  ['year','yearRooms','yearBook','yearLogin','yearContact'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.textContent = year;
  });

  // Theme toggle (persist in localStorage)
  const themeToggleButtons = document.querySelectorAll('#themeToggle');
  const current = localStorage.getItem('theme') || 'light';
  setTheme(current);

  themeToggleButtons.forEach(btn=>{
    btn.addEventListener('click', () => {
      const newTheme = document.body.classList.contains('light') ? 'dark' : 'light';
      setTheme(newTheme);
    });
  });

  function setTheme(t){
    document.body.classList.remove('light','dark');
    document.body.classList.add(t);
    localStorage.setItem('theme', t);
  }

  // Booking page logic
  const bookingForm = document.getElementById('bookingForm');
  if(bookingForm){
    const roomType = document.getElementById('roomType');
    const pricePerNight = document.getElementById('pricePerNight');
    const nightsEl = document.getElementById('nights');
    const checkin = document.getElementById('checkin');
    const checkout = document.getElementById('checkout');

    const priceMap = { 'Deluxe':3000, 'Suite':6000, 'Standard':2000 };

    // If query param ?room=... present -> preselect
    const urlParams = new URLSearchParams(window.location.search);
    const pre = urlParams.get('room');
    if(pre && priceMap[pre]) roomType.value = pre;

    function updatePrice(){
      const r = roomType.value;
      const p = priceMap[r] || 0;
      pricePerNight.textContent = `₹ ${p.toLocaleString()}`;
      // compute nights
      const d1 = new Date(checkin.value);
      const d2 = new Date(checkout.value);
      let nights = 0;
      if(checkin.value && checkout.value && d2 > d1){
        nights = Math.round((d2 - d1) / (1000*60*60*24));
      }
      nightsEl.textContent = nights;
    }

    roomType.addEventListener('change', updatePrice);
    checkin.addEventListener('change', updatePrice);
    checkout.addEventListener('change', updatePrice);

    // init
    updatePrice();

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('guestName').value.trim();
      const email = document.getElementById('guestEmail').value.trim();
      const rtype = roomType.value;
      const d1 = new Date(checkin.value);
      const d2 = new Date(checkout.value);
      if(!name || !email || !checkin.value || !checkout.value){
        alert('Please fill required fields');
        return;
      }
      if(d2 <= d1){ alert('Checkout should be after checkin'); return; }
      const nights = Math.round((d2 - d1) / (1000*60*60*24));
      const price = priceMap[rtype] || 0;
      const total = price * nights;

      // Save booking to localStorage (demo)
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const booking = {
        id: Date.now(),
        name, email, room: rtype,
        checkin: checkin.value, checkout: checkout.value,
        nights, total
      };
      bookings.push(booking);
      localStorage.setItem('bookings', JSON.stringify(bookings));

      // Show confirmation modal
      const modal = document.getElementById('confirmModal');
      const confirmText = document.getElementById('confirmText');
      confirmText.innerHTML = `
        Thank you <strong>${name}</strong>!<br/>
        Your <strong>${rtype}</strong> is booked from <strong>${checkin.value}</strong> to <strong>${checkout.value}</strong>.<br/>
        Nights: <strong>${nights}</strong> — Total: <strong>₹ ${total.toLocaleString()}</strong>
      `;
      modal.classList.remove('hidden');
    });

    // modal close
    const closeModal = document.getElementById('closeModal');
    if(closeModal) closeModal.addEventListener('click', () => {
      document.getElementById('confirmModal').classList.add('hidden');
      bookingForm.reset();
      updatePrice();
    });

    // clear button
    const clearBtn = document.getElementById('clearBtn');
    if(clearBtn) clearBtn.addEventListener('click', ()=> bookingForm.reset());
  }

});
