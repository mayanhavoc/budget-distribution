window.onload = function () {
	const form = document.getElementById('input-form');
	const table = document.getElementById('data-table');
	const weightsForm = document.getElementById('weights-form');
	const weightTable = document.getElementById('weights-table');

	let employees = []; // Define the employees array
	let totalBudget;
	let timeWeight;
	let seniorityWeight;

	weightsForm.addEventListener('submit', function (event) {
		event.preventDefault();

		timeWeight = parseFloat(document.getElementById('time-weight').value);
		seniorityWeight = parseFloat(
			document.getElementById('seniority-weight').value
		);
		totalBudget = parseFloat(document.getElementById('total-budget').value);
		const weightTableRow = weightTable.insertRow(-1);
		weightTableRow.innerHTML = `
        <td>${timeWeight}</td>
        <td>${seniorityWeight}</td>
        <td>${totalBudget}</td>
    `;
	});

	form.addEventListener('submit', function (event) {
		event.preventDefault();

		const employeeName = document.getElementById('employee-name').value;
		const desiredIncome = parseFloat(
			document.getElementById('desired-income').value
		);
		const timeAllocated = parseFloat(
			document.getElementById('time-allocated').value
		);
		const seniority = parseFloat(document.getElementById('seniority').value);

		const normalizedTime = timeAllocated / 100;

		const actualMonthlyIncome = (
			desiredIncome *
			(normalizedTime * timeWeight + seniority * seniorityWeight)
		).toFixed(2);

		// Add the input data to the employees array
		employees.push({
			name: employeeName,
			income: desiredIncome,
			time: normalizedTime,
			seniority: seniority,
		});

		// Clear form fields after adding an employee
		form.reset();

		// Display the added employee in the table
		displayEmployeeData();
	});
	function displayEmployeeData() {
		// Clear the table before displaying the updated data
		table.innerHTML = '';

		employees.forEach((employee) => {
			const row = table.insertRow();
			row.innerHTML = `
        <td>${employee.name}</td>
        <td>${employee.income}</td>
        <td>${employee.time * 100}%</td>
        <td>${employee.seniority}</td>
      `;
		});

		// Function to perform calculations and update the tables
		function performCalculations() {
			const totalDesiredIncome = employees.reduce(
				(total, employee) => total + employee.income,
				0
			);

			employees.forEach((employee) => {
				const proportionalBudget =
					totalBudget * (employee.income / totalDesiredIncome);
				employee.capBudget = Math.min(proportionalBudget, totalBudget);
			});

			employees.forEach((employee) => {
				employee.weightedScore =
					employee.time * timeWeight + employee.seniority * seniorityWeight;
			});

			let remainingBudget =
				totalBudget -
				employees.reduce((total, employee) => total + employee.capBudget, 0);

			while (remainingBudget > 0) {
				employees.forEach((employee) => {
					if (employee.capBudget < employee.income) {
						const additionalBudget =
							remainingBudget * (employee.weightedScore / totalBudget);
						const allocatedAmount = Math.min(
							additionalBudget,
							employee.income - employee.capBudget,
							remainingBudget
						);

						employee.capBudget += allocatedAmount;
						remainingBudget -= allocatedAmount;
					}
				});
			}

			// Clear the table to display updated results
			table.innerHTML = `
      <tr>
        <th>Employee Name</th>
        <th>Desired Income</th>
        <th>Time Allocated</th>
        <th>Seniority</th>
        <th>Actual Monthly Income</th>
      </tr>
    `;

			// Update the table with the calculated values
			employees.forEach((employee) => {
				const newRow = table.insertRow(-1);
				newRow.innerHTML = `
        <td>${employee.name}</td>
        <td>${employee.income}</td>
        <td>${employee.time * 100}%</td>
        <td>${employee.seniority}</td>
        <td>$${employee.capBudget.toFixed(2)}</td>
      `;
			});

			const sumCapBudgets = employees.reduce(
				(total, employee) => total + employee.capBudget,
				0
			);
			console.log(`Sum of Cap Budgets: $${sumCapBudgets.toFixed(2)}`);

			if (totalBudget - sumCapBudgets == 0) {
				console.log('Cap budgets equal total available budget.');
			} else {
				console.log('Cap budgets exceed the total available budget.');
			}
		}

		// Call the function to perform calculations and update the table
		document
			.getElementById('calculate-button')
			.addEventListener('click', function () {
				performCalculations();
			});
	}
};
