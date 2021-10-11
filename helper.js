module.exports = {
    IsComponent: function (interaction) {
        return interaction.message != null;
    },
    GetInteractionName: function (interaction) {
        return interaction.message
            ? interaction.message.interaction.name
            : interaction.data.name;
    },
    GetInteractionArgs: function (interaction) {
        if (interaction.message) {
            return interaction.data.custom_id != '_'
                ? interaction.data.custom_id
                : null;
        }

        return interaction.data.options
            ? interaction.data.options[0].value
            : null;
    },
    CreateResponseObject: function (opts) {
        let isComponent = this.IsComponent(opts.interaction);

        let resp = {
            data: {
                type: isComponent ? 7 : 4,
                data: {

                    tts: false
                }
            }
        }

        if (opts.content) {
            resp.data.data.content = opts.content;
        }

        if (opts.embeds) {
            resp.data.data.embeds = opts.embeds;
        }

        if (opts.components) {
            resp.data.data.components = [{ type: 1, components: opts.components }];
        }

        return resp;
    },
    AddRefreshComponent: function (arg) {
        return {
            type: 2,
            emoji: {
                name: "refresh",
                id: "883151135941214299"
            },
            style: 2,
            custom_id: arg ? arg : '_',
        }
    },
    AddPaginationComponents: function (params) {

    }
}