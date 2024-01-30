(() => {
    const theForm = document.getElementById('theForm');
    const authpage = document.getElementById('authpage');
    const cardDropdown = document.getElementById('CardSelector');
    const dealerDropdown = document.getElementById('Dealer');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const login = document.getElementById('login');
    const pdfButton = document.getElementById('pdfButton');
    const amount = document.getElementById('amount');
    const customer = document.getElementById('name');

    //block unwanted users- cheap way out and get user for the signature
    theForm.style.display = 'none';
    login.addEventListener('click', e => {
        e.preventDefault();

        if (username.value === 'admin' && password.value === 'jmauto') {
            theForm.style.display = 'flex';
            pdfButton.disabled = false;
            authpage.remove();

        } else { alert('Enter username and password'); }
    });

    let cardInfo = { cards: [] };

    //get the date for the pdf later on
    const today = new Date().toLocaleDateString('en-US', { month: "long", day: "numeric", year: "numeric" }).replace(',', '');

    //use the functions to populate the dropdown menus
    getDealers();
    getCardName();


    //variables for the selected option 
    let data = {
        selectedCreditCard: undefined,
        selectedDealership: undefined,
    };

    //setting the variable (using the function) to the selection from the dropdown menu
    dropdownSelection(cardDropdown, data, 'selectedCreditCard', cardInfo.cards);
    dropdownSelection(dealerDropdown, data, 'selectedDealership');

    //using the jsPDF library  
    let newPDF = new jsPDF();



    //hitting the submit button will generate a PDF with the selected details
    pdfButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await getCards();

        const selectedCard = cardInfo.cards.find(card => card.name === data.selectedCreditCard);
        //this would be the async/await to use the backend of the app
        const backdata = {
            name: customer.value,
            amount: parseFloat(amount.value),
            CardSelector: data.selectedCreditCard,
            dealer: data.selectedDealership,
        };

        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(backdata),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            };

        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        };

        //get the logo for the top of the pdf
        const img = new Image();
        img.src = 'images/image001.png';

        const companyname = 'JM Auto Group LLC';

        newPDF.addImage(img, 'png', 20, 20, 100, 30);
        newPDF.setFontType("bold").text(`${companyname}`, 165, 30, 'center')
        newPDF.setFontType('normal').setFontSize(12).text(`\n109 Ave M\nBrooklyn, NY 11230\n\nPh: 718 - 627 - 7100\nFx: 718 - 627 - 8855`, 165, 30, 'center');

        newPDF.setFontType("bold").text(`CREDIT CARD AUTHORIZATION FORM`, 100, 85, 'center');

        newPDF.setFontType("normal").text(`Date: ${today}`, 20, 100);
        newPDF.text(`DEALER: ${data.selectedDealership}`, 20, 105);
        newPDF.text(`CUSTOMER NAME: ${customer.value}`, 20, 115)
        newPDF.setFontType("normal").text(`Please charge $${amount.value} on ${selectedCard.name} ${selectedCard.number} exp: ${selectedCard.exp} CVV: ${selectedCard.cvv} `, 30, 125, { maxWidth: 165 });
        newPDF.text(`Billing address: 109 Ave M Brooklyn, NY 11230 `, 30, 140);

        newPDF.text('Signature x________________________________', 30, 158)
        newPDF.setFont('DancingScript', 'normal').setFontSize(32).text(`${selectedCard.sign}`, 60, 156);


        newPDF.output('dataurlnewwindow');

        //newPDF.save(`${customer.value} ${today}.pdf`);


        //reset the pdf to be empty for the next customer input
        newPDF = new jsPDF();

        //reset the form to blank so that can start over
        theForm.reset();
    })


    //where I put all the reusable functions


    //set the variable to the selected option from the dropdown menu
    function dropdownSelection(dropdown, targetObject, key) {
        dropdown.addEventListener('change', e => {
            targetObject[key] = e.target.value;
        });
    }



    //using the data from the sheets to place into dropdown
    async function getDealers() {
        try {
            const response = await fetch('/lease');
            const data = await response.json();
            data.dealers.forEach(dealer => {
                const option = document.createElement("option");
                option.value = dealer;
                option.textContent = dealer;
                dealerDropdown.appendChild(option);
            });

        }
        catch (error) {
            console.log('Fetch Error - Dealers ', error);

        };
    };
    async function getCardName() {
        try {
            const response = await fetch('/card');
            const data = await response.json();
            data.creditcard.forEach(card => {
                const option = document.createElement("option");
                option.value = card;
                option.textContent = card;
                cardDropdown.appendChild(option);
            });

        }
        catch (error) {
            console.log('Fetch Error - Dealers ', error);

        };
    };

    async function getCards() {
        try {
            const response = await fetch('/cards');
            const data = await response.json();
            cardInfo = {
                cards: data.cards.map(cardDetails => {
                    return {
                        name: cardDetails[0],
                        sign: cardDetails[1],
                        number: cardDetails[2],
                        exp: cardDetails[3],
                        cvv: cardDetails[4]
                    };
                })
            };
        }
        catch (error) {
            console.log('Fetch Error - Card Info ', error);

        };
    };

})();
