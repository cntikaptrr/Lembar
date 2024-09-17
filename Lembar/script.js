let services = [];
let filteredServices = [];
let currentPage = 1;
const rowsPerPage = 10;

async function fetchServices() {
    try {
        const response = await fetch('getServices.php');
        if (!response.ok) throw new Error('Network response was not ok');

        const textData = await response.text();
        console.log('Raw response:', textData);
        try {
            const parsedData = JSON.parse(textData);
            console.log('Parsed data:', parsedData);
            return parsedData;
        } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            return [];
        }
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

async function initialize() {
    services = await fetchServices();
    filteredServices = [...services];
    renderTable();
}

function renderTable() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedServices = filteredServices.slice(start, end);

    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    paginatedServices.forEach((service, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="#">${index + 1 + start}</td>
            <td data-label="Seksi">${service.teams_nama}</td>
            <td data-label="Nama Layanan">${service.layanan_nama}</td>
            <td data-label="Action"><button class="action-btn" onclick="showDetails('${service.layanan_id}')">Persyaratan</button></td>
        `;
        tableBody.appendChild(row);
    });

    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const totalPages = Math.ceil(filteredServices.length / rowsPerPage);

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'Prev';
    prevBtn.classList.add('pagination-btn', 'prev-btn');
    prevBtn.onclick = () => changePage(currentPage - 1);
    prevBtn.disabled = currentPage === 1;
    pagination.appendChild(prevBtn);

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const btn = document.createElement('button');
            btn.innerText = i;
            btn.classList.add('pagination-btn');
            if (i === currentPage) btn.classList.add('active');
            btn.onclick = () => changePage(i);
            pagination.appendChild(btn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const ellipsis = document.createElement('span');
            ellipsis.innerText = '...';
            ellipsis.classList.add('pagination-ellipsis');
            pagination.appendChild(ellipsis);
        }
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Next';
    nextBtn.classList.add('pagination-btn', 'next-btn');
    nextBtn.onclick = () => changePage(currentPage + 1);
    nextBtn.disabled = currentPage === totalPages;
    pagination.appendChild(nextBtn);
}

function changePage(page) {
    currentPage = page;
    renderTable();
}

function filterTable() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    filteredServices = services.filter(service =>
        service.teams_nama.toLowerCase().includes(searchInput) ||
        service.layanan_nama.toLowerCase().includes(searchInput)
    );
    currentPage = 1;
    renderTable();
}

function showDetails(id) {
    const service = services.find(s => s.layanan_id === String(id));
    if (!service) {
        console.error('Service not found for ID:', id);
        return;
    }

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="modal-header">
            <h4>${service.layanan_nama}</h4>
            <span class="close-btn" onclick="closeModal()">&times;</span>
        </div>
        <div class="modal-body">
            <div class="modal-detail-item">
                <strong>Format Surat:</strong>
                <span class="detail-value">${service.layanan_format}</span>
            </div>
            <div class="modal-detail-item">
                <strong>Janji Layanan:</strong>
                <span class="detail-value">${service.layanan_janji}</span>
            </div>
            <div class="modal-detail-item">
                <strong>Hardcopy:</strong>
                <span class="detail-value ${service.layanan_hardcopy === '1' ? 'hardcopy-green' : 'hardcopy-red'}">
                    ${service.layanan_hardcopy === '1' ? 'Wajib Diajukan' : 'Tidak Wajib Diajukan'}
                </span>
            </div>
            <h5>Persyaratan</h5>
            <ul>
                ${service.ceklist_uraian.map((item, index) => `
                    <li>${item}</li>
                `).join('')}
            </ul>
        </div>
    `;

    const modal = document.getElementById('detailModal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    modal.style.display = 'none';
}

window.onclick = (event) => {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

initialize();