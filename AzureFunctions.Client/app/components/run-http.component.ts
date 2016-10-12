import {Component, Input, Inject, ElementRef, Output, EventEmitter, ViewChildren, QueryList} from '@angular/core';
import {HttpRunModel, Param} from '../models/http-run';
import {FunctionInfo} from '../models/function-info';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PopOverComponent} from './pop-over.component';
import {Constants} from '../models/constants';

@Component({
    selector: 'run-http',
    templateUrl: 'templates/run-http.component.html',
    styleUrls: ['styles/function-dev.style.css', 'styles/run-http.style.css'],
    pipes: [TranslatePipe],
    directives: [PopOverComponent],
    inputs: ['functionInfo', 'functionInvokeUrl']

})
export class RunHttpComponent {
    @Output() validChange = new EventEmitter<boolean>();
    model: HttpRunModel = new HttpRunModel();
    valid: boolean;


    constructor(private _translateService: TranslateService) {
    }

    set functionInfo(value: FunctionInfo) {
        if (value.test_data) {
            try {
                this.model = JSON.parse(value.test_data);
                if (this.model.body === undefined) {
                    this.model = undefined;
                }
            } catch (e) {
                this.model = undefined;
            }
        }

        if (this.model === undefined) {
            this.model = new HttpRunModel();
            this.model.availableMethods = [
                Constants.httpMethods.POST,
                Constants.httpMethods.GET,
                Constants.httpMethods.DELETE,
                Constants.httpMethods.HEAD,
                Constants.httpMethods.PATCH,
                Constants.httpMethods.PUT
            ];
            this.model.method = Constants.httpMethods.POST;
            this.model.body = value.test_data;
        }
    }

    set functionInvokeUrl(value: string) {
        var params = this.getQueryParams(value);
        params.forEach((p) => {
            var findResult = this.model.queryStringParams.find((qp) => {
                return qp.name === p.name;
            });
            if (!findResult) {
                this.model.queryStringParams.push(p);
            }
        });
        this.change();
    }

    removeQueryStringParam(index: number) {
        this.model.queryStringParams.splice(index, 1);
        this.change();
    }

    removeHeader(index: number) {
        this.model.headers.splice(index, 1);
        this.change();
    }

    addQueryStringParam() {
        this.model.queryStringParams.push(
            {
                name: "",
                value: "",
            });
        this.change();
    }

    addHeader() {
        this.model.headers.push(
            {
                name: "",
                value: "",
            });
        this.change();
    }

    change(event?: any) {
        var emptyQuery = this.model.queryStringParams.find((p) => {
            return !p.name;
        });

        var emptyHeader = this.model.headers.find((h) => {
            return !h.name;
        });

        this.valid = !(emptyQuery || emptyHeader);
        this.validChange.emit(this.valid);
    }

    private getQueryParams(url: string): Param[] {
        var result = [];
        var queryArray = url.split('?');

        if (queryArray.length > 1) {
            var query = queryArray[1];
            var vars = query.split('&');
            if (vars.length === 1) {
                vars[0] = query;
            }

            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                result.push({
                    name: decodeURIComponent(pair[0]),
                    value: decodeURIComponent(pair[1]),
                    isFixed: true
                });
            }
        }
        return result;
    }
}