let fiches = JSON.parse(localStorage.getItem('fiches')) || [];
let ficheIndex = null;

function ajouterIngredient(type) {
    const container = document.getElementById(`${type}-ingredients-container`);
    const index = container.children.length;
    const ingredientHTML = `
        <div class="ingredient">
            <input type="text" placeholder="Nom de l'ingrédient" oninput="calculerCout('${type}', ${index})">
            <input type="number" placeholder="Quantité" step="0.01" oninput="calculerCout('${type}', ${index})">
            <input type="text" placeholder="Unité (kg, litre, pièce)" oninput="calculerCout('${type}', ${index})">
            <input type="number" placeholder="Prix au kilo/litre/pièce" step="0.01" oninput="calculerCout('${type}', ${index})">
            <input type="number" placeholder="Coût" readonly>
            <button type="button" onclick="supprimerIngredient('${type}', ${index})">Supprimer</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', ingredientHTML);
}

function calculerCout(type, index) {
    const container = document.getElementById(`${type}-ingredients-container`);
    const ingredient = container.children[index];
    const inputs = ingredient.querySelectorAll('input');
    const quantite = parseFloat(inputs[1].value) || 0;
    const prixUnite = parseFloat(inputs[3].value) || 0;
    const unite = inputs[2].value.trim().toLowerCase();

    let prixParUnite = prixUnite;

    // Convertir le prix en fonction de l'unité
    if (unite === 'kg') {
        prixParUnite = prixUnite; // Prix au kilogramme
    } else if (unite === 'g') {
        prixParUnite = prixUnite / 1000; // Prix au gramme converti en prix au kilogramme
    } else if (unite === 'litre') {
        prixParUnite = prixUnite; // Prix au litre
    } else if (unite === 'ml') {
        prixParUnite = prixUnite / 1000; // Prix au millilitre converti en prix au litre
    } else if (unite === 'pièce' || unite === 'pièce') {
        prixParUnite = prixUnite; // Prix par pièce
    } else {
        prixParUnite = 0; // Unité non reconnue
    }

    const cout = quantite * prixParUnite;
    inputs[4].value = cout.toFixed(2);

    recalculerCoutTotal();
}

function recalculerCoutTotal() {
    const types = ['entree', 'plat', 'dessert'];
    let totalCout = 0;

    types.forEach(type => {
        const container = document.getElementById(`${type}-ingredients-container`);
        container.querySelectorAll('input[type="number"]:nth-of-type(5)').forEach(input => {
            totalCout += parseFloat(input.value) || 0;
        });
    });

    document.getElementById('cout').value = totalCout.toFixed(2);
    recalculerMargeBrute();
}

function recalculerMargeBrute() {
    const cout = parseFloat(document.getElementById('cout').value) || 0;
    const prixVente = parseFloat(document.getElementById('prix-vente').value) || 0;
    document.getElementById('marge-brute').value = (prixVente - cout).toFixed(2);
}

function sauvegarderFiche() {
    const fiche = {
        date: document.getElementById('date').value,
        entree: extraireDonnees('entree'),
        plat: extraireDonnees('plat'),
        dessert: extraireDonnees('dessert'),
        cout: document.getElementById('cout').value,
        marge: document.getElementById('marge').value,
        prixVente: document.getElementById('prix-vente').value,
        margeBrute: document.getElementById('marge-brute').value
    };

    if (ficheIndex !== null) {
        fiches[ficheIndex] = fiche;
    } else {
        fiches.push(fiche);
    }
    localStorage.setItem('fiches', JSON.stringify(fiches));
    afficherFiches();
}

function extraireDonnees(type) {
    const container = document.getElementById(`${type}-ingredients-container`);
    return {
        nom: document.getElementById(`${type}-nom`).value,
        ingredients: Array.from(container.children).map(ingredient => {
            const inputs = ingredient.querySelectorAll('input');
            return {
                nom: inputs[0].value,
                quantite: inputs[1].value,
                unite: inputs[2].value,
                prix: inputs[3].value,
                cout: inputs[4].value
            };
        })
    };
}

function afficherFiches() {
    const listeFiches = document.getElementById('liste-fiches');
    listeFiches.innerHTML = '';
    fiches.forEach((fiche, index) => {
        const li = document.createElement('li');
        li.textContent = `Date: ${fiche.date}, Entrée: ${fiche.entree.nom}, Plat: ${fiche.plat.nom}, Dessert: ${fiche.dessert.nom}`;
        li.onclick = () => chargerFiche(index);
        const btnDelete = document.createElement('button');
        btnDelete.textContent = 'Supprimer';
        btnDelete.onclick = (e) => {
            e.stopPropagation();
            supprimerFiche(index);
        };
        li.appendChild(btnDelete);
        listeFiches.appendChild(li);
    });
}

function chargerFiche(index) {
    ficheIndex = index;
    const fiche = fiches[index];
    document.getElementById('date').value = fiche.date;
    ['entree', 'plat', 'dessert'].forEach(type => {
        chargerSection(type, fiche[type]);
    });
    document.getElementById('cout').value = fiche.cout;
    document.getElementById('marge').value = fiche.marge;
    document.getElementById('prix-vente').value = fiche.prixVente;
    document.getElementById('marge-brute').value = fiche.margeBrute;
}

function chargerSection(type, data) {
    document.getElementById(`${type}-nom`).value = data.nom;
    const container = document.getElementById(`${type}-ingredients-container`);
    container.innerHTML = data.ingredients.map((ingredient, i) => `
        <div class="ingredient">
            <input type="text" value="${ingredient.nom}" oninput="calculerCout('${type}', ${i})">
            <input type="number" value="${ingredient.quantite}" step="0.01" oninput="calculerCout('${type}', ${i})">
            <input type="text" value="${ingredient.unite}" oninput="calculerCout('${type}', ${i})">
            <input type="number" value="${ingredient.prix}" step="0.01" oninput="calculerCout('${type}', ${i})">
            <input type="number" value="${ingredient.cout}" readonly>
            <button type="button" onclick="supprimerIngredient('${type}', ${i})">Supprimer</button>
        </div>
    `).join('');
}

function supprimerIngredient(type, index) {
    const container = document.getElementById(`${type}-ingredients-container`);
    container.removeChild(container.children[index]);
    recalculerCoutTotal();
}

function supprimerFiche(index) {
    fiches.splice(index, 1);
    localStorage.setItem('fiches', JSON.stringify(fiches));
    afficherFiches();
}

function rechercherFiche() {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const listeFiches = document.getElementById('liste-fiches');
    listeFiches.innerHTML = '';
    fiches.filter(fiche => 
        fiche.date.includes(searchQuery) ||
        fiche.entree.nom.toLowerCase().includes(searchQuery) ||
        fiche.plat.nom.toLowerCase().includes(searchQuery) ||
        fiche.dessert.nom.toLowerCase().includes(searchQuery) ||
        fiche.entree.ingredients.some(ing => ing.nom.toLowerCase().includes(searchQuery)) ||
        fiche.plat.ingredients.some(ing => ing.nom.toLowerCase().includes(searchQuery)) ||
        fiche.dessert.ingredients.some(ing => ing.nom.toLowerCase().includes(searchQuery))
    ).forEach((fiche, index) => {
        const li = document.createElement('li');
        li.textContent = `Date: ${fiche.date}, Entrée: ${fiche.entree.nom}, Plat: ${fiche.plat.nom}, Dessert: ${fiche.dessert.nom}`;
        li.onclick = () => chargerFiche(index);
        const btnDelete = document.createElement('button');
        btnDelete.textContent = 'Supprimer';
        btnDelete.onclick = (e) => {
            e.stopPropagation();
            supprimerFiche(index);
        };
        li.appendChild(btnDelete);
        listeFiches.appendChild(li);
    });
}

function imprimer() {
    window.print();
}

function nouvelleFiche() {
    ficheIndex = null;
    document.querySelectorAll('input').forEach(input => input.value = '');
    document.querySelectorAll('.ingredients-container').forEach(container => container.innerHTML = '');
    recalculerCoutTotal();
}

function initialiserExemples() {
    if (!fiches.length) {
        fiches = [
            {
                date: '2024-08-01',
                entree: {
                    nom: 'Salade César',
                    ingredients: [
                        { nom: 'Laitue', quantite: '100', unite: 'g', prix: '5.00', cout: '5.00' },
                        { nom: 'Croutons', quantite: '50', unite: 'g', prix: '2.00', cout: '1.00' }
                    ]
                },
                plat: {
                    nom: 'Steak Frites',
                    ingredients: [
                        { nom: 'Steak', quantite: '200', unite: 'g', prix: '15.00', cout: '30.00' },
                        { nom: 'Pommes de terre', quantite: '300', unite: 'g', prix: '2.00', cout: '6.00' }
                    ]
                },
                dessert: {
                    nom: 'Tarte aux Pommes',
                    ingredients: [
                        { nom: 'Pommes', quantite: '300', unite: 'g', prix: '3.00', cout: '9.00' },
                        { nom: 'Pâte brisée', quantite: '200', unite: 'g', prix: '2.00', cout: '4.00' }
                    ]
                },
                cout: '52.00',
                marge: '20',
                prixVente: '65',
                margeBrute: '13.00'
            },
            {
                date: '2024-08-02',
                entree: {
                    nom: 'Soupe à l\'oignon',
                    ingredients: [
                        { nom: 'Oignons', quantite: '500', unite: 'g', prix: '2.00', cout: '10.00' },
                        { nom: 'Bouillon', quantite: '1', unite: 'l', prix: '5.00', cout: '5.00' }
                    ]
                },
                plat: {
                    nom: 'Poulet Rôti',
                    ingredients: [
                        { nom: 'Poulet', quantite: '1', unite: 'kg', prix: '12.00', cout: '12.00' },
                        { nom: 'Pommes de terre', quantite: '500', unite: 'g', prix: '2.00', cout: '4.00' }
                    ]
                },
                dessert: {
                    nom: 'Crème Brûlée',
                    ingredients: [
                        { nom: 'Crème', quantite: '500', unite: 'ml', prix: '3.00', cout: '6.00' },
                        { nom: 'Sucre', quantite: '100', unite: 'g', prix: '1.00', cout: '1.00' }
                    ]
                },
                cout: '28.00',
                marge: '25',
                prixVente: '35',
                margeBrute: '7.00'
            }
        ];
        localStorage.setItem('fiches', JSON.stringify(fiches));
    }
}

// Initialiser l'affichage des fiches sauvegardées
initialiserExemples();
afficherFiches();
