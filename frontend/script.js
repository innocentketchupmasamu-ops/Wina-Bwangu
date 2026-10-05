//side menu variables
const menuButton = document.getElementById('menu-button')
const sideMenu = document.getElementById('side-menu')
const dropdownButton = document.getElementById('dropdown-button');
const dropdownMenu = document.getElementById('dropdown-menu');

const svgIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M10.0719 8.02397L5.7146 3.66666L6.33332 3.04794L11 7.71461V8.33333L6.33332 13L5.7146 12.3813L10.0719 8.02397Z"
                        fill="#C5C5C5" />
                </svg>`


menuButton.addEventListener('click', function () {
    sideMenu.classList.toggle('open');
    menuButton.classList.toggle('active')
});

dropdownButton.addEventListener('click', function () {
    dropdownMenu.classList.toggle('show');
    dropdownButton.classList.toggle('highlight');
});

//prepare a list of items with class '.nested button' and place in container nestedButtons
const nestedButtons = document.querySelectorAll('.nested-button')

//for each item in the list, assign to a variable called button
nestedButtons.forEach(function (button) {
    //add event listener to each item in the list
    button.addEventListener('click', function () {
        //find the element just below the list item
        const nestedMenu = button.nextElementSibling;
        //assign a class to the found element for css
        nestedMenu.classList.toggle('show');
        button.classList.toggle('open');
    });

    button.insertAdjacentHTML('beforeend', svgIcon);
});



//modal variables
const modal = document.getElementById('service-modal');
const modalServiceName = document.getElementById('modal-service-name');
const modalRevenue = document.getElementById('modal-revenue');
const modalDescription = document.getElementById('modal-description');
const modalCloseButton = document.getElementById('modal-close');

const serviceButtons = document.querySelectorAll('.service');

//clicking outside side menu closes it 
document.addEventListener('click', function (event) {
    if (!menuButton.contains(event.target) && !sideMenu.contains(event.target) && !modal.contains(event.target)) {
        sideMenu.classList.remove('open');
        menuButton.classList.remove('active');
    }
})


function openModal() {
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

modalCloseButton.addEventListener('click', closeModal);

modal.addEventListener('click', function (e) {
    if (e.target === modal) {
        closeModal();
    }
})


serviceButtons.forEach(button => {
    button.addEventListener('click', function (e) {
        e.stopPropagation();

        //get id of service and booth clicked
        const serviceID = this.getAttribute('service-id');
        const serviceName = this.innerText;

        modalServiceName.innerText = serviceName;
        //loading feedback
        modalRevenue.innerText = 'Revenue per kwacha: Calculating...';
        modalDescription.innerText = 'Fetching latest metric from backend...';

        openModal();


        //make AJAX request to the backend server
        fetch(`/api/services/${serviceID}`)
            .then(response => response.json())
            .then(data => {
                //update modal with real data from the server
                modalServiceName.innerText = serviceName;

                modalRevenue.innerText = `Revenue per kwacha: K${data.revenuePerKwacha}`;

                modalDescription.innerText = `${data.boothName} ${data.locationName}`;

            })

            .catch(error => {
                console.warn('Backend server not connected yet.');
                modalRevenue.innerText = 'Revenue per kwacha: N/A';
                modalDescription.innerText = `Unable to load details right now.`;

            });

    });
});



//toast notification 
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');

    toast.innerText = message;

    //remove toast after 2 seconds
    setTimeout(() => {
        toast.remove();
    }, 2000)
}
showToast('Obtaining metrics from backend....', 'info');




//       ----TABLE BEHAVIOUR---

//table 1: cumulative totals and remaining monthly credit
function loadFinanceMetrics() {

    //fetch metrics from backend
    fetch('/api/services/summary')
        .then(response => response.json())
        .then(Data => {
            //loop through data and populate table cells
            Data.foreach(item => {
                const row = document.querySelector(`tr[service-id="${item.serviceID}"]`);

                if (row) {
                    const totalCell = row.querySelector('.cell-total');
                    const creditCell = row.querySelector('.cell-credit');

                    if (totalCell) totalCell.innerText = `K${item.cumulativeTotal.toLocaleString()}`;
                    if (creditCell) creditCell.innerText = `K${item.remainingCredit.toLocaleString()}`;
                }
            });

            taxPerformance(Data);
        })



    //for testing. Delete later
    const FakeData = [
        {
            serviceID:
                'airtel-money',
            cumulativeTotal: 50000,
            remainingCredit: 10000
        },
        {
            serviceID:
                'mtn-money',
            cumulativeTotal: 45000,
            remainingCredit: 9000
        },
        {
            serviceID:
                'zamtel-money',
            cumulativeTotal: 15000,
            remainingCredit: 20000
        },
        {
            serviceID: 'zanaco',
            cumulativeTotal: 36000,
            remainingCredit: 8000
        },
        {
            serviceID: 'fnb',
            cumulativeTotal: 24500,
            remainingCredit: 7000
        }

    ];

    FakeData.forEach(item => {
        const row = document.querySelector(`tr[service-id="${item.serviceID}"]`);

        if (row) {
            const totalCell = row.querySelector('.cell-total');
            const creditCell = row.querySelector('.cell-credit');

            if (totalCell) totalCell.innerText = `K${item.cumulativeTotal.toLocaleString()}`;
            if (creditCell) creditCell.innerText = `K${item.remainingCredit.toLocaleString()}`;
        }
    });

    taxPerformance(FakeData);
    //delete
}


//table 2: cumulative revenue
function loadRevenueMetrics() {

    fetch('/api/booth/summary')
        .then(response => response.json())
        .then(Data => {

            Data.forEach(item => {
                const row = document.querySelector(`#booth-summary-table tr[booth-id="${item.boothID}"]`);
                if (row) {
                    const revenueCell = row.querySelector('.cell-revenue');

                    if (revenueCell) revenueCell.innerText = `K${item.revenue.toLocaleString()}`;
                }
            });
        })




    //for testing. Delete later
    const boothFakeData = [{ boothID: 'wina6', revenue: 42000 }];

    boothFakeData.forEach(item => {
        const row = document.querySelector(`#booth-summary-table tr[booth-id="${item.boothID}"]`);
        if (row) {
            const revenueCell = row.querySelector('.cell-revenue');
            if (revenueCell) revenueCell.innerText = `K${item.revenue.toLocaleString()}`;
        }
    });
    //delete
}


//table 3: frequency
function loadFrequencyMetrics() {

    const rows = document.querySelectorAll('#frequency-table tbody tr');
    console.log(rows.length);

    fetch(`/api/frequency/summary`)
        .then(response => response.json())
        .then(Data => {
            Data.forEach(item => {
                const cell = document.querySelector(`#frequency-table tr[service-id="${item.serviceID}"] [booth-id="${item.boothID}"]`);
                if (cell) {

                    cell.innerText = item.count.toLocaleString();
                }
            });
        })


    //for testing. Delete later
    const frequencyFakeData = [{ serviceID: "zanaco", boothID: "wina4", count: 40 }];

    frequencyFakeData.forEach(item => {
        const cell = document.querySelector(`#frequency-table tr[service-id="${item.serviceID}"] [booth-id="${item.boothID}"]`);
        if (cell) {
            cell.innerText = item.count.toLocaleString();
        }
    });
    //delete    
}


// pie chart
function showPieChart() {
    const canvas = document.getElementById('pie-chart');
    const ctx = canvas.getContext("2d");

    //keeps pie chart from being blurry
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 190 * dpr;
    canvas.height = 190 * dpr;
    canvas.style.width = '190px';
    canvas.style.height = '190px';
    ctx.scale(dpr, dpr);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';


    fetch('/api/financial/summary')
        .then(response => response.json())
        .then(Data => {
            showPieChart(Data.totalRevenue, Data.totalCapital);
        })

    //when backend is connected, delete 145000 and 76000. They're just for testing.
    let sliceA = { size: /*Number(totalRevenue)*/  145000, color: ' rgb(64, 128, 224)' };
    let sliceB = { size: /*Number(totalCapital)*/  76000, color: '#6c6591' };

    const values = [sliceA.size, sliceB.size];

    const total = values.reduce((acc, val) => acc + val, 0);

    let startAngle = 0;


    // calculate angles
    values.forEach((value, index) => {

        const angle = (value / total) * Math.PI * 2;

        const centerX = 95;
        const centerY = 95;
        const radius = centerX;

        //Draw slices
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
            centerX, centerY,
            radius,
            startAngle,
            startAngle + angle
        );
        ctx.closePath();

        const currentColor = index === 0 ? sliceA.color : sliceB.color;

        ctx.fillStyle = currentColor;
        ctx.fill();

        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        startAngle += angle;
    });


    //show legend
    const legend = document.getElementById('pie-chart-legend');

    legend.innerHTML =
        `<div class="legend-item">
            
            <div class="legend-color" style="background-color:${sliceA.color}" style="grid-area: l1"></div>
            <div class="legend-label" style="grid-area: l2">Total Revenue: K${sliceA.size.toLocaleString()} - ${((sliceA.size / total) * 100).toFixed(2)} %</div>
            
            <div class="legend-color" style="background-color:${sliceB.color}" style="grid-area: l3"></div>
            <div class="legend-label" style="grid-area: l4">Total Capital: K${sliceB.size.toLocaleString()} - ${((sliceB.size / total) * 100).toFixed(2)} %</div>
        </div>`;
}


//table 4: tax obligation performance
function taxPerformance(serviceTotals) {

    const taxRate = 0.16  //assuming its 16%

    const serviceTaxes = serviceTotals.map(item => ({
        serviceID: item.serviceID,
        taxAmount: item.cumulativeTotal * taxRate
    }));


    const maxTax = Math.max(...serviceTaxes.map(item => item.taxAmount));

    serviceTaxes.forEach(item => {

        const percentage = maxTax > 0 ? Math.round((item.taxAmount / maxTax) * 100) : 0;

        const row = document.querySelector(`#tax-table tr[service-id="${item.serviceID}"]`);
        if (!row) return;

        const taxCell = row.querySelector('.cell-total');
        if (!taxCell) return;


        const currentTotal = taxCell.textContent.trim();

        const amount = document.createElement('span');
        amount.textContent = currentTotal;


        const percent = document.createElement('span');
        percent.textContent = `${percentage}%`;


        const fill = document.createElement('div');
        fill.className = 'tax-bar';
        fill.style.width = `${percentage}%`;

        fill.appendChild(amount);
        fill.appendChild(percent);


        taxCell.textContent = '';
        taxCell.appendChild(fill);
    });
}


//Table 5: All transactions
let allTransactions = [];
let currentPage = 1;
const rowsPerPage = 10;

async function DatabaseTransactions() {
    const response = await
        fetch('/api/transactions');
    allTransactions = await
        response.json();
}
DatabaseTransactions();


//Test data. Delete later
function generateFakeTransactions(count) {
    allTransactions = [];
    for (let i = 1; i <= count; i++) {
        allTransactions.push({
            transactionID: `TXN-${1000 + i}`,
            booth: `Booth ${(i % 4) + 1}`,
            location: `Location ${(i % 3) + 1}`,
            service: `Service ${(i % 2) + 1}`,
            revenuePerKwacha: "0.05",
            transactionAmount: (Math.random() * 500 + 10).toFixed(2)
        });
    }
}
generateFakeTransactions(125);
//delete


function renderTableRows() {
    const tableBody = document.querySelector('#transactions-table tbody');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const pageItems = allTransactions.slice(startIndex, endIndex);

    pageItems.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${transaction.transactionID}</td>
        <td>${transaction.booth}</td>
        <td>${transaction.location}</td>
        <td>${transaction.service}</td>
        <td>${transaction.revenuePerKwacha}</td>
        <td>${transaction.transactionAmount}</td>
        `;
        tableBody.appendChild(row);
    });
}
renderTableRows();


function renderPagination() {
    const container = document.querySelector('#pagination-controls');
    if (!container) return;

    const totalPages = Math.ceil(allTransactions.length / rowsPerPage);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage + 1)) {
            pages.push(i);
        }
    }


    let html = `<div class="pagination-buttons">`;
    html += `<button id="previous-button" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;



    html += `<button id="next-button" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    html += `</div>`;

    html += `<span class="page-indicator">Page ${currentPage} of ${totalPages}</span>`;

    container.innerHTML = html;

}

function setupPaginationEvents(container) {
    container.addEventListener('click', (e) => {
        const target = e.target;
        const totalPages = Math.ceil(allTransactions.length / rowsPerPage);

        if (target.classList.contains('page-button')) {
            currentPage = parseInt(target.dataset.page, 10);

            updateTableAndPagination();
            return;
        }

        if (target.id === 'previous-button' && currentPage > 1) {

            currentPage = Number(currentPage) - 1;

            updateTableAndPagination();
            return;
        }


        if (target.id === 'next-button' && currentPage < totalPages) {

            currentPage = Number(currentPage) + 1;

            updateTableAndPagination();
            return;
        }
    });
}

function updateTableAndPagination() {
    renderTableRows();
    renderPagination();
}



document.addEventListener('DOMContentLoaded', loadFinanceMetrics);
document.addEventListener('DOMContentLoaded', loadRevenueMetrics);
document.addEventListener('DOMContentLoaded', loadFrequencyMetrics);

document.addEventListener('DOMContentLoaded', showPieChart);

document.addEventListener('DOMContentLoaded', () => {
    updateTableAndPagination();

    const container = document.querySelector('#pagination-controls');
    if (container) {
        setupPaginationEvents(container);
    }
});

