/// <reference path="../TGrid.ts" />
/// <reference path="../IHtmlProvider.ts" />
/// <reference path="../BaseHtmlProvider.ts" />
/// <reference path="../ItemViewModel.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../IFooterViewModel.ts" />
/// <reference path="KnockoutFilterPopupViewModel.ts" />
/// <reference path="KnockoutFooterViewModel.ts" />


module TesserisPro.TGrid {

    export class KnockoutHtmlProvider extends BaseHtmlProvider {

        // Table Methods

        public getTableElement(option: Options): HTMLElement {
            var table = document.createElement("table");
            table.className = "tgrid-table";
            return table;
        }

        public getElemntsSize(container: HTMLElement, items: Array<ItemViewModel>): number {
            var size = 0;
            var children = container.children;
            for (var i = 0; i < children.length; i++) {
                var child = children.item(i);
                var viewModel = <ItemViewModel>(ko.contextFor(child).$root);

                if (viewModel != null && items.indexOf(viewModel) > 0) {
                    size += child.clientHeight;
                }
            }

            return size;
        }

        public getFirstVisibleItem(container: HTMLElement, items: Array<ItemViewModel>, scrollTop: number): ItemViewModel {
            var size = 0;
            var children = container.children;
            for (var i = 0; i < children.length; i++) {
                var child = children.item(i);
                var viewModel = <ItemViewModel>(ko.contextFor(child).$root);
                if (viewModel != null && items.indexOf(viewModel) > 0) {
                    size += child.clientHeight;
                }
                if (size > scrollTop) {
                    return viewModel;
                }
            }

            return null;
        }

        public getFooterViewModel() {
            var knockoutFooterViewModel = new KnockoutFooterViewModel(0, 0, 0, 0);
            return knockoutFooterViewModel;
        }

        public getFilterPopupViewModel(container: HTMLElement) {
            var filterPopupViewModel = new KnockoutFilterPopupViewModel(container);
            return filterPopupViewModel;
        }

        public updateTableHeadElement(option: Options, header: HTMLElement, groupByContainer: HTMLElement, filterPopupContainer: HTMLElement, columnsResized: (c: ColumnInfo) => void) {
            this.updateGroupByPanel(option, groupByContainer);

            if (header.innerHTML != null && header.innerHTML != "") {
                //add intends for groupBy
                this.showNeededIntends(header, option.groupBySortDescriptors.length, Grid.getGridObject(header));

                // update table header
                if (option.enableSorting) {
                    this.removeArrows(header);
                    var element = header.getElementsByTagName("th");

                    for (var i = option.columns.length, j = 0; i < element.length, j < option.columns.length; i++, j++) {
                        if (option.sortDescriptor.path == option.columns[j].sortMemberPath && option.columns[j].sortMemberPath != null) {
                            this.addArrows(element[i].getElementsByClassName("tgrid-header-cell-buttons")[0], option, i);
                        }
                    }
                }

            } else {

                // Create table header
                var head = document.createElement("tr");
                this.appendIndent(head, option.columns.length, true);
                this.showNeededIntends(head, option.groupBySortDescriptors.length, Grid.getGridObject(header));

                for (var i = 0; i < option.columns.length; i++) {
                    var headerCell = document.createElement("th");
                    headerCell.className = "tgrid-header-cell";
                    var headerMainContainer = document.createElement("div");
                    headerMainContainer.className = "tgrid-header-cell-container";
                    var headerContent = document.createElement("div");
                    var headerButtons = document.createElement("div");
                    headerContent.className = "tgrid-header-cell-content";
                    headerButtons.className = "tgrid-header-cell-buttons";
                    headerMainContainer.appendChild(headerContent);
                    headerMainContainer.appendChild(headerButtons);
                    headerCell.appendChild(headerMainContainer);

                    headerCell.setAttribute("width", option.columns[i].width);

                    if (option.columns[i].header != null) {
                        option.columns[i].header.applyTemplate(headerContent);
                    } else {
                        var headerText = option.columns[i].member != null ? option.columns[i].member : "";
                        this.buildDefaultHeader(headerContent, headerText);
                    }

                    // Arrows
                    if (option.enableSorting) {
                        // Method changing sorting
                        (function (i) {
                            headerCell.onclick = (e) => Grid.getGridObject(<HTMLElement>e.target).sortBy(option.columns[i].sortMemberPath);
                        })(i);
                        if (option.sortDescriptor.path == option.columns[i].sortMemberPath && option.columns[i].sortMemberPath != null) {
                            this.addArrows(headerButtons, option, i);
                        }
                    }

                    // Filter
                    this.addFilterButton(option, header, filterPopupContainer, headerButtons, i);

                    if (option.columns[i].resizable) {
                        var columnResize = document.createElement("div");
                        columnResize.className = "tgrid-header-column-resize";

                        columnResize.onclick = e => e.stopImmediatePropagation();

                        (function (i, headerCell, columnResize) {
                            var documentMouseMove = null;
                            var position = 0;
                            columnResize.onmousedown = e => {
                                e.stopImmediatePropagation();
                                console.log("test");
                                position = e.screenX;
                                documentMouseMove = document.onmousemove;
                                document.onmousemove = m => {
                                    if (position != 0) {
                                        option.columns[i].width = (parseInt(option.columns[i].width) + m.screenX - position).toString();
                                        position = m.screenX;
                                        columnsResized(option.columns[i]);
                                    }
                                };
                            };

                            document.onmouseup = e => {
                                document.onmousemove = documentMouseMove;
                                position = 0;
                            }
                    })(i, headerCell, columnResize);


                        headerButtons.appendChild(columnResize);
                    }

                    head.appendChild(headerCell);
                }
                var placeholderColumn = document.createElement("th");
                placeholderColumn.classList.add("tgrid-placeholder");
                head.appendChild(placeholderColumn);

                header.appendChild(head);
                ko.applyBindings(option.parentViewModel, head);
            }
        }

        public updateTableBodyElement(option: Options, container: HTMLElement, items: Array<ItemViewModel>, selected: (item: ItemViewModel, multi: boolean) => boolean): void {
            if (!option.showDetailFor.isDetailColumn) {
                option.showDetailFor.column = -1;
            }

            for (var i = 0; i < items.length; i++) {
                this.appendTableElement(option, container, items[i], 0, selected);
            }

            //Hide table on mobile devices
            container.classList.add("desktop");
        }

        public updateTableDetailRow(option: Options, container: HTMLElement, item: ItemViewModel) {
            var detailRow = container.getElementsByClassName("details");
            if (detailRow.length > 0) {
                detailRow[0].parentNode.removeChild(detailRow[0]);
            }

            if (option.selectionMode == SelectionMode.Multi) {
                if (!option.ctrlKey) {
                    for (var i = 0; i < container.children.length; i++) {
                        (<HTMLElement>container.children.item(i)).classList.remove("selected");
                    }
                }
                if (option.isSelected(item)) {
                    option.selectedRow.classList.add("selected");
                }
                else {
                    option.selectedRow.classList.remove("selected");
                }
            }
            if (option.selectionMode == SelectionMode.Single) {
                for (var i = 0; i < container.children.length; i++) {
                    (<HTMLElement>container.children.item(i)).classList.remove("selected");
                }
                if (option.isSelected(item)) {
                    option.selectedRow.classList.add("selected");
                }
                else {
                    option.selectedRow.classList.remove("selected");
                }
            }

            var selectedElement = container.getElementsByClassName("selected");

            // Insert row details after selected item
            if (this.hasDetails(selectedElement, option)) {
                var details = this.buildDetailsRow(option);
                details.classList.add("details");
                insertAfter(selectedElement[0], details);
                ko.applyBindings(option.showDetailFor, details);
            }
        }

        public updateTableFooterElement(option: Options, footer: HTMLElement, totalItemsCount: number, footerModel: IFooterViewModel): void {
            //if there isn't footer template in grid
            if (option.tableFooterTemplate == null && option.enablePaging) {
                this.buildDefaultTableFooterElement(option, footer, totalItemsCount);
            } else if (option.tableFooterTemplate != null) {
                var footerContainer = document.createElement("div");
                if (option.enablePaging) {
                    this.buildDefaultTableFooterElement(option, footer, totalItemsCount);
                }
                option.tableFooterTemplate.applyTemplate(footerContainer);
                ko.applyBindings(footerModel, footerContainer);

                footer.appendChild(footerContainer);

            }
        }

        public updateFilteringPopUp(option: Options, filterPopup: HTMLElement, filterPopupModel: IFilterPopupViewModel) {
            if (option.filterPopup == null) {
                this.buildDefaultFiltringPopUp(option, filterPopup);
            } else {
                var filterContainer = document.createElement("div");
                filterContainer.className = "tgrid-filter-popup-container";
                option.filterPopup.applyTemplate(filterContainer);
                filterPopup.innerHTML = "";
                filterPopup.appendChild(filterContainer);

                ko.applyBindings(filterPopupModel, filterPopup);
            }
        }

        private appendTableElement(option: Options, container: HTMLElement, item: ItemViewModel, groupLevel: number, selected: (item: ItemViewModel, multi: boolean) => boolean): void {
            var itemWithDetails: any;
            var rowWithDetail: HTMLElement;

            if (item.isGroupHeader) {
                var groupHeader = this.buildGroupHeaderRow(option, item.item);
                container.appendChild(groupHeader);
                ko.applyBindings(item, groupHeader);
            } else {
                var row = this.buildRowElement(option, item, container, selected);

                container.appendChild(row);
                ko.applyBindings(item, row);
            }
        }


        private buildRowElement(option: Options, item: ItemViewModel, container: HTMLElement, selected: (item: ItemViewModel, multi: boolean) => boolean): HTMLElement {
            var row = document.createElement("tr");
            row.classList.add("table-body-row");

            if (option.isSelected(item.item)) {
                row.classList.add("selected");
            }

            this.appendIndent(row, option.groupBySortDescriptors.length, false);

            for (var i = 0; i < option.columns.length; i++) {
                var cell = document.createElement("td");

                if (option.columns[i].cell != null) {
                    option.columns[i].cell.applyTemplate(cell);
                } else {
                    if (option.columns[i].member != null) {
                        cell = this.createDefaultCell(cell, option.columns[i].member);
                    }
                }
                row.appendChild(cell);
            }

            var placeholderColumn = document.createElement("td");
            placeholderColumn.classList.add("tgrid-placeholder");
            row.appendChild(placeholderColumn);

            (function (item) {
                row.onclick = function (e) {
                    if (option.selectionMode != SelectionMode.None) {
                        option.ctrlKey = e.ctrlKey;
                        option.selectedRow = <HTMLElement>this;
                        selected(item, e.ctrlKey);
                    }
                };
            })(item);

            return row;
        }

        private buildDetailsRow(option: Options): HTMLElement {
            var detailTr = document.createElement("tr");
            var detailTd = document.createElement("td");

            this.appendIndent(detailTr, option.groupBySortDescriptors.length, false);

            detailTr.classList.add("details");
            detailTd.setAttribute("colspan", (option.columns.length + 1).toString());

            if (option.showDetailFor.column == -1) {
                option.detailsTemplateHtml.applyTemplate(detailTd)
            }
            else {
                option.columns[option.showDetailFor.column].cellDetail.applyTemplate(detailTd);
            }

            detailTr.appendChild(detailTd);

            return detailTr;
        }

        private buildGroupHeaderRow(option: Options, groupHeaderDescriptor: GroupHeaderDescriptor): HTMLElement {

            var headerTr = document.createElement("tr");
            var headerTd = document.createElement("td");

            this.appendIndent(headerTr, groupHeaderDescriptor.level, false);

            var colspan = option.columns.length + 1 + option.groupBySortDescriptors.length - groupHeaderDescriptor.level;
            headerTd.setAttribute("colspan", colspan.toString());
            headerTd.classList.add("tgrid-table-group-header");
            headerTr.classList.add("tgrid-table-group-header");
            if (option.enableCollapsing) {
                if (!groupHeaderDescriptor.collapse) {
                    headerTd.onclick = (e) => {
                        TesserisPro.TGrid.Grid.getGridObject(<HTMLElement>e.target).setCollapsedFilters(groupHeaderDescriptor.filterDescriptor);
                    }
                } else {
                    headerTd.onclick = (e) => {
                        TesserisPro.TGrid.Grid.getGridObject(<HTMLElement>e.target).removeCollapsedFilters(groupHeaderDescriptor.filterDescriptor);
                    }
                }
            }
            if (option.groupHeaderTemplate != null) {
                option.groupHeaderTemplate.applyTemplate(headerTd);//(!groupHeaderDescriptor.collapse ? "close" : "open") +
            } else {
                headerTd = this.createDefaultGroupHeader(headerTd);
            }


            headerTr.appendChild(headerTd);

            return headerTr;
        }

        private addArrows(sortArrowContainer: Node, option: Options, columnNumber: number) {
            if (option.sortDescriptor.asc) {
                var up = document.createElement("div");
                up.classList.add("tgrid-arrow-up");
                sortArrowContainer.appendChild(up);
            }
            if (!option.sortDescriptor.asc) {
                var down = document.createElement("div");
                down.classList.add("tgrid-arrow-down");
                sortArrowContainer.appendChild(down);
            }
            return sortArrowContainer;
        }

        private removeArrows(htmlNode: HTMLElement): void {
            var element = htmlNode.getElementsByClassName("tgrid-arrow-up");
            if (element.length == 1) {
                element[0].parentNode.removeChild(element[0]);
            }
            var element = htmlNode.getElementsByClassName("tgrid-arrow-down");
            if (element.length == 1) {
                element[0].parentNode.removeChild(element[0]);
            }
        }

        private appendIndent(target: HTMLElement, level: number, isHeader: boolean) {
            var tag = isHeader ? "th" : "td";
            for (var i = 0; i < level; i++) {
                var cell = document.createElement(tag);
                cell.className = "tgrid-table-indent-cell";
                target.appendChild(cell);
            }
        }

        // Mobile Methods

        public updateMobileItemsList(option: Options, container: HTMLElement, items: Array<ItemViewModel>, selected: (item: ItemViewModel, multi: boolean) => boolean): void {
            if (!option.showDetailFor.isDetailColumn) {
                option.showDetailFor.column = -1;
            }

            for (var i = 0; i < items.length; i++) {
                this.appendMobileElement(option, container, items[i], 0, selected);
            }

            //Hide table on mobile devices
            var bodyClass = container.getAttribute("class");
            if (bodyClass == null || bodyClass == undefined || bodyClass == '') {
                bodyClass = "mobile";
            }
            else {
                if (bodyClass.indexOf("mobile") == -1) {
                    bodyClass += " mobile";
                }
            }
            container.setAttribute("class", bodyClass);
        }

        public updateMobileDetailRow(option: Options, container: HTMLElement, item: ItemViewModel): void {
            var detailRow = container.getElementsByClassName("details");
            if (detailRow.length > 0) {
                detailRow[0].parentNode.removeChild(detailRow[0]);
            }

            if (option.selectionMode == SelectionMode.Multi) {
                if (!option.ctrlKey) {
                    for (var i = 0; i < container.children.length; i++) {
                        (<HTMLElement>container.children.item(i)).classList.remove("selected");
                    }
                }
                if (option.isSelected(item.item)) {
                    option.selectedRow.classList.add("selected");
                }
                else {
                    (<HTMLElement>container.children.item(i)).classList.remove("selected");
                }
            }
            if (option.selectionMode == SelectionMode.Single) {
                for (var i = 0; i < container.children.length; i++) {
                    (<HTMLElement>container.children.item(i)).classList.remove("selected");
                }
                if (option.isSelected(item)) {
                    option.selectedRow.classList.add("selected");
                }
                else {
                    (<HTMLElement>container.children.item(i)).classList.remove("selected");
                }
            }

            var selectedElement = container.getElementsByClassName("selected");

            // Insert row details after selected item
            if (this.hasDetails(selectedElement, option)) {
                var details = this.buildMobileDetailsRow(option);
                details.classList.add("details");
                insertAfter(selectedElement[0], details);
                ko.applyBindings(option.showDetailFor, details);
            }
        }

        private appendMobileElement(option: Options, container: HTMLElement, item: ItemViewModel, groupLevel: number, selected: (item: ItemViewModel, multi: boolean) => boolean): void {
            
            var itemWithDetails: any;
            var rowWithDetail: HTMLElement;
            if (item.isGroupHeader && option.groupHeaderTemplate != null) {
                var mobileGroupHeader = this.buildGroupMobileHeaderRow(option, item.item);
                container.appendChild(mobileGroupHeader);
                ko.applyBindings(item, mobileGroupHeader);
            } else {
                var row = this.buildMobileRowElement(option, item, container, selected);

                container.appendChild(row);
                ko.applyBindings(item, row);
            }
        }

        private buildMobileRowElement(option: Options, item: ItemViewModel, container: HTMLElement, selected: (item: ItemViewModel, multi: boolean) => boolean): HTMLElement {
            var row = document.createElement("div");
            row.classList.add("tgrid-mobile-row");

            if (option.isSelected(item.item)) {
                row.classList.add("selected");
            }

            for (var i = 0; i < option.groupBySortDescriptors.length; i++) {
                row.innerHTML += "<div class='tgrid-mobile-indent-div'></div>"
            }

            var rowTemplate = document.createElement("div");
            rowTemplate.classList.add('tgrid-mobile-div');
            if (option.mobileTemplateHtml != null) {
                option.mobileTemplateHtml.applyTemplate(rowTemplate);
            } else {
                rowTemplate = this.createDefaultMobileTemplate(rowTemplate, option);
            }
            row.appendChild(rowTemplate);

            var placeholderColumn = document.createElement("td");
            placeholderColumn.classList.add("tgrid-placeholder");
            row.appendChild(placeholderColumn);

            (function (item) {
                row.onclick = function (e) {
                    if (option.selectionMode != SelectionMode.None) {
                        option.ctrlKey = e.ctrlKey;
                        option.selectedRow = <HTMLElement>this;
                        var s = container;
                        selected(item, e.ctrlKey);
                    }
                };
            })(item);

            return row;
        }

        private buildMobileDetailsRow(option: Options): HTMLElement {
            var detailDiv = document.createElement("div");

            detailDiv.classList.add("tgrid-mobile-details");
            option.showDetailFor.column == -1 ? option.detailsTemplateHtml.applyTemplate(detailDiv) : option.columns[option.showDetailFor.column].cellDetail.applyTemplate(detailDiv);

            return detailDiv;
        }

        private createDefaultCell(cell: HTMLTableCellElement, defaultCellBindingName: string): HTMLTableCellElement {
            var spanForCell = document.createElement("span");
            var textBinding = "text: item.".concat(defaultCellBindingName)
            spanForCell.setAttribute("data-bind", textBinding);
            cell.appendChild(spanForCell);

            return cell;
        }

        public createDefaultGroupHeader(tableRowElement: any) {
            var groupHeaderContainer = document.createElement("div");
            var groupHeaderName = document.createElement("span");
            groupHeaderName.setAttribute("data-bind", "text: item.value");
            groupHeaderName.setAttribute("style", "color: green;");
            groupHeaderContainer.appendChild(groupHeaderName);
            tableRowElement.appendChild(groupHeaderContainer);
            return tableRowElement;
        }

        public bindData(option: Options, elementForBinding: HTMLElement) {
            var viewModel = ko.contextFor(option.target);
            ko.applyBindings(viewModel, elementForBinding);
        }
    }
}