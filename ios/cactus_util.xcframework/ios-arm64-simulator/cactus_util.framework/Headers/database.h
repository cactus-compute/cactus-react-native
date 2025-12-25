#ifndef DATABASE_H
#define DATABASE_H

#include <string>
struct sqlite3;

class Database {
private:
    sqlite3* db;
    std::string db_path;
    
    bool create_tables();
    
public:
    Database(const std::string& path = "cactus.db");
    ~Database();
    
    bool initialize();
    bool register_app(const std::string& device_id, const std::string& token_expiry_date, const std::string& token);
    bool get_registration(std::string& device_id, std::string& token_expiry_date, std::string& token);
    const char* get_device_id();
    void close();
    
    bool is_open() const;
};

#endif // DATABASE_H
