sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecCorretor/helpers/UfHelpDialog",
	"br/com/idxtecCorretor/helpers/ParceiroNegocioHelpDialog",
	"br/com/idxtecCorretor/helpers/MunicipiosHelpDialog",
	"br/com/idxtecCorretor/services/Session"
], function(Controller, History, MessageBox, JSONModel, UfHelpDialog, ParceiroNegocioHelpDialog, MunicipiosHelpDialog, Session) {
	"use strict";

	return Controller.extend("br.com.idxtecCorretor.controller.GravarCorretor", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarcorretor").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		ufReceived: function() {
			this.getView().byId("uf").setSelectedKey(this.getModel("model").getProperty("/Uf"));
		},
		
		parceiroNegocioReceived: function() {
			this.getView().byId("parceironegocio").setSelectedKey(this.getModel("model").getProperty("/ParceiroNegocio"));
		},
		
		municipioReceived: function(){
			this.getView().byId("municipio").setSelectedKey(this.getModel("model").getProperty("/Municipio"));
		},
		
		handleSearchUf: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			UfHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchParceiro: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			ParceiroNegocioHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchMunicipio: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			MunicipiosHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			this.getView().byId("parceironegocio").setValue(null);
			this.getView().byId("municipio").setValue(null);
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Corretor"
				});
			
				var oNovoCorretor = {
					"Id": 0,
					"Nome": "",
					"ParceiroNegocio": 0,
					"Email": "",
					"Telefone": "",
					"Uf": 0,
					"Municipio": 0,
					"Observacoes": "",
					"Empresa" : Session.get("EMPRESA_ID"),
					"Usuario": Session.get("USUARIO_ID"),
					"EmpresaDetails": { __metadata: { uri: "/Empresas(" + Session.get("EMPRESA_ID") + ")"}},
					"UsuarioDetails": { __metadata: { uri: "/Usuarios(" + Session.get("USUARIO_ID") + ")"}}
				};
				
				oJSONModel.setData(oNovoCorretor);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Corretor"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					},
					error: function(oError) {
						MessageBox.error(oError.responseText);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createCorretor();
			} else if (this._operacao === "editar") {
				this._updateCorretor();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
					window.history.go(-1);
			} else {
				oRouter.navTo("corretor", {}, true);
			}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.ParceiroNegocio = oDados.ParceiroNegocio ? oDados.ParceiroNegocio : 0;
			oDados.Uf = oDados.Uf ? oDados.Uf : 0;
			oDados.Municipio = oDados.Municipio ? oDados.Municipio : 0;
			
			oDados.ParceiroNegocioDetails = {
				__metadata: {
					uri: "/ParceiroNegocios(" + oDados.ParceiroNegocio + ")"
				}
			};
			
			oDados.UfDetails = {
				__metadata: {
					uri: "/Ufs(" + oDados.Uf + ")"
				}
			};
			
			oDados.MunicipioDetails = {
				__metadata: {
					uri: "/Municipios(" + oDados.Municipio + ")"
				}
			};

			return oDados;
		},
		
		_createCorretor: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.create("/Corretors", this._getDados(), {
				success: function() {
					MessageBox.success("Corretor inserido com sucesso!", {
						onClose: function(){
							that._goBack(); 
						}
					});
				}
			});
		},
		
		_updateCorretor: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Corretor alterado com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("nome").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		},
		
		getModel : function(sModel) {
			return this.getOwnerComponent().getModel(sModel);	
		}
	});
});