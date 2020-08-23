
//Budget Controller
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calulateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        data.totals[type] = sum;     
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create item based on type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our Data Structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },
        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function() {

            // calculate total income and expenses
            calulateTotal('exp');
            calulateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }

        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPercentages;
        },
        testing: function() {
            console.log(data);
        }
    }

})();

//UI Controller
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber =  function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length -3) + ',' + int.substr(int.length-3, 3);
        }

        dec = numSplit[1];

        return  (type === 'exp' ? '-' : '+') +  ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Will be wither inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML strings with some plaeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields:  function () {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            // fieldsArray.forEach((current, index, array) => {
                //current.value = "";
            // });
            nodeListForEach(fields, function(cur) {
                cur.value = "";
            })
            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome,'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '----';
            }
        },

        displayPercentages: function (percentages) {
            var fields  = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            nodeListForEach(fields, function(current, index) {
                current.textContent = percentages[index] + '%';
                if (percentages[index] > 0) {
                    current.textContent  = percentages[index] + '%';
                } else {
                    current.textContent  = '----';
                }
            });
            
        },

        displayMonth: function() {
            var now, year, month, months;
            now = new Date();

            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        }, 

        changeType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +  
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    };
})();

// Global App Controller
var controller = (function (budgetCtrl, uiCtrl) {

    var setupEventListeners = function () {

        var DOM = uiCtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('click', UIController.changeType);
        
    }

    var updateBudget = function() {
        // Calculate the Budget
        budgetController.calculateBudget();

        // Return the budget
        var budget = budgetController.getBudget();
        
        // Display the budget on the UI
        UIController.displayBudget(budget);

    }

    var updatePercentages = function () {
        // Caluclate the Percentages
        budgetController.calculatePercentages();

        // Read the percentages from the budget controller
        var percentages = budgetController.getPercentages();

        // Display the percentages on the UI
        UIController.displayPercentages(percentages);
        
    }

    var ctrlAddItem = function () {
        var input, newItem;

        // Get Inputs
        input = uiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            // Add the item to the budgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    
            // Add the item to the UI
            UIController.addListItem(newItem, input.type);
    
            // Clear the fields
            UIController.clearFields();
    
            // Calculate and update the budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }

    }

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            // 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Delete the item from the data structure
            budgetController.deleteItem(type, ID);

            // Delete the Item from the UI
            UIController.deleteListItem(itemID);

            // Update and show the new budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }
    }

    return {
        init: function () {
            UIController.displayMonth();
            UIController.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            })
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();