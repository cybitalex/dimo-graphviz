





$(document).ready(function() {
    self.searchDatatable = $('#searchResultsTable').DataTable({
        searching: false,
        paging: false,
        info: false,
        scrollY: "300px",
        scrollCollapse: true,
        columnDefs: [{
            orderable: false,
            className: 'select-checkbox',
            targets: 0
        }],
        dom: "Bfrtip",
        buttons: [
            'selectAll',
            'selectNone',
        ],
        select: {
            style: 'os',
            selector: 'tr'
        },
    });

});





self.addRowToSearchTable = (item) => {

	const table = document.getElementById("searchResultsTableDiv")

	if(table.style.visibility=="hidden") {
		table.style.visibility = 'visible'
	}


    self.searchDatatable.row.add(item).draw();

}



self.clearSearchDatatable = () => {
	self.searchDatatable.clear().draw()
}


self.getSelectedRowsDatatable = () => {

	const indicies = self.searchDatatable.rows({selected: true }).indexes()

	return [indicies, self.searchDatatable.rows(indicies).nodes()]


}

self.removeRowsByIndexes = (indexes) => {
	self.searchDatatable.rows(indexes).remove().draw()

}





