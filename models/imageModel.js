module.exports = (sequelize, DataTypes) => {

    const Image = sequelize.define("images", {

        image_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },

        file_name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        date_created: {
            type: DataTypes.STRING,
            allowNull: false
        },

        s3_bucket_path: {
            type: DataTypes.STRING,
            allowNull: false
        }

    },
    {
        timestamps: false
    }
    )

    return Image

}