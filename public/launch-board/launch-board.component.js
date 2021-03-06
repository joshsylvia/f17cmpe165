"use strict"

angular
	.module('launchBoard')
	.component('launchBoard', {
		templateUrl: "launch-board/launch-board.template.html",

		bindings: {
			userId: '<'
		},

		controller: ["$location", "$uibModal", "dataService", function ($location, $uibModal, dataService) {
			this.$onInit = function () {
				this.isPrivate = this.userId == undefined

				if (this.isPrivate) this.userId = sessionStorage.getItem('userId')	// Apply logged-in user's ID

				this.reload()
			}

			this.reload = function () {
				dataService.getLaunches(this.userId)
					.then(launches => {
						this.launches = launches

						for (let i = 0; i < this.launches.length; i++) {
							this.launches[i].yays = this.launches[i].voteYay.length - this.launches[i].voteNay.length;
						
							this.launches[i].yay = function () {
									dataService.castVote('up', sessionStorage.getItem('userId'), launches[i]._id)
								}
							this.launches[i].nay = function () {
									dataService.castVote('down', sessionStorage.getItem('userId'), launches[i]._id) 
								}
						}
					})
			}

			this.create = function () {
				$location.path('/create-launch')
			}

			this.view = function (launch, edit) {
				$uibModal.open({
					component: 'edit',
					resolve: {
						meta: {
							title: (edit ? "Edit " : "") + launch.name
						},
						fields: {
							name: ['text', 'Name'],
							description: ['text', 'Description'],
							tags: ['text', 'Tags']
						},
						data: launch,
						readonly: !edit
					}
				}).result.then(result => {
					
					const launch = result.data
					console.log(result.data.tags)
					if(result.data.tags.length !== 0){
						launch.tags = result.data.tags
					}
					console.log(launch)
					// launch.tags = result.data.tags.split(',') Dis borked on delete
					console.log((result.del ? "Deleting" : "Updating") + ": " + JSON.stringify(launch))

					result.del ? dataService.deleteLaunch(launch) : dataService.updateLaunch(launch)
						.then(() => this.reload())
				})
			}
		}]
	})
